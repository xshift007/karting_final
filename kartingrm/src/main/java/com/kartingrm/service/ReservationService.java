package com.kartingrm.service;

import com.kartingrm.dto.ReservationRequestDTO;
import com.kartingrm.dto.ReservationRequestDTO.ParticipantDTO;
import com.kartingrm.entity.Client;
import com.kartingrm.entity.Participant;
import com.kartingrm.entity.Reservation;
import com.kartingrm.entity.Session;
import com.kartingrm.entity.ReservationStatus;
import com.kartingrm.repository.PaymentRepository;
import com.kartingrm.repository.ReservationRepository;
import com.kartingrm.repository.SessionRepository;
import com.kartingrm.service.mail.MailService;
import com.kartingrm.service.pricing.PricingService;
import com.kartingrm.entity.SpecialDay;
import java.time.DayOfWeek;
import com.kartingrm.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepo;
    private final ClientService clients;
    private final SessionService sessionSvc;
    /* NUEVO : necesitamos consultar superposiciones y aforo */
    private final SessionRepository sessionRepo;
    private final PricingService pricing;
    private final MailService mail;
    private final HolidayService holidayService;
    private final PaymentRepository paymentRepo;

    private static final SecureRandom RND = new SecureRandom();
    private static final String ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Value("${kartingrm.default-session-capacity:15}")
    private int defaultCapacity;


    /* ---------------- crear ------------------------------------------------ */
    @Transactional
    public Reservation createReservation(ReservationRequestDTO dto) {
        validateSpecialDay(dto);

        /* ---------- 1) PREVENIR SOLAPES DE BLOQUES ---------- */
        boolean overlap = sessionRepo.existsOverlap(
                dto.sessionDate(),
                dto.startTime(),
                dto.endTime());
        if (overlap)           // no permitas bloquear la pista dos veces
            throw new IllegalStateException("Horario no disponible");

        /* ---------- 2) OBTENER o CREAR SESIÓN EXACTA ---------- */
        Session s = sessionSvc.createIfAbsent(
                dto.sessionDate(),
                dto.startTime(),
                dto.endTime(),
                defaultCapacity
        );

        /* ---------- 3) VERIFICAR CAPACIDAD RESTANTE ---------- */
        int already   = reservationRepo.participantsInSession(s.getId());
        int incoming  = dto.participantsList().size();
        if (already + incoming > s.getCapacity()) {
            throw new IllegalStateException("Capacidad de la sesión superada");
        }

        // 3) Generamos código único
        String code;
        do { code = nextCode(); } while (reservationRepo.existsByReservationCode(code));

        // 4) Calculamos precios, guardamos reserva y enviamos mail
        var pr = pricing.calculate(dto);
        Reservation r = reservationRepo.save(buildEntity(dto, s, pr, code));
        sessionSvc.notifyAvailabilityUpdate();
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override public void afterCommit() {
                       mail.sendConfirmation(r);
                    }
                });
        return r;
    }

    /* ---------------- actualizar ------------------------------------------ */
    @Transactional
    public Reservation update(Long id, ReservationRequestDTO dto) {
        validateSpecialDay(dto);

        Reservation existing = findById(id);

        if (!existing.getSession().getSessionDate().equals(dto.sessionDate()) ||
                !existing.getSession().getStartTime().equals(dto.startTime()) ||
                !existing.getSession().getEndTime().equals(dto.endTime()))
            throw new IllegalStateException("No se puede cambiar el bloque; cree otra reserva");

        /* ---------- Actualizar aforo ---------- */
        int already =
            reservationRepo.participantsInSession(existing.getSession().getId())
            - existing.getParticipants();      // libera antiguos
        if (already + dto.participantsList().size() > existing.getSession().getCapacity()) {
            throw new IllegalStateException("Capacidad de la sesión superada");
        }

        Session s = existing.getSession();
        int requested = dto.participantsList().size();

        var pr = pricing.calculate(dto);

        existing.setParticipants(requested);
        existing.setDuration(pr.minutes());
        existing.setBasePrice(pr.baseUnit());
        existing.setDiscountPercentage(pr.totalDiscPct());
        existing.setFinalPrice(pr.finalPrice());
        existing.getParticipantsList().clear();
        existing.getParticipantsList()
                .addAll(toEntities(dto.participantsList(), existing));

        Reservation saved = reservationRepo.save(existing);
        sessionSvc.notifyAvailabilityUpdate();
        return saved;
    }

    /* ---------------- consultas ------------------------------------------- */
    public List<Reservation> findAll() {
        return reservationRepo.findAll();
    }

    public Reservation findById(Long id) {
        return reservationRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no existe"));
    }

    public void save(Reservation r) {
        reservationRepo.save(r);
        sessionSvc.notifyAvailabilityUpdate();
    }



    /* ------------------------ eliminar COMPLETO --------------------------- */
    @Transactional
    public void deleteReservation(Long reservationId) {

        Reservation r = findById(reservationId);

        /* 1) revertir visita si estaba confirmada */
        if (r.getStatus() == ReservationStatus.CONFIRMED) {
            clients.decrementVisits(r.getClient());
        }

        /* 2) eliminar pago (si existe FK) */
        paymentRepo.deleteByReservationId(reservationId);

        /* 3) borrar reserva (participants se eliminan por orphanRemoval) */
        reservationRepo.delete(r);

        /* 4) si la sesión quedó vacía la quitamos para mantener limpio el rack */
        Long sessionId = r.getSession().getId();
        if (reservationRepo.participantsInSession(sessionId) == 0) {
            sessionRepo.deleteById(sessionId);
        }

        /* 5) avisar a stream SSE */
        sessionSvc.notifyAvailabilityUpdate();
    }




    /* ---------------- helpers privados ------------------------------------ */
    /** REGULAR/WEEKEND/HOLIDAY debe cuadrar con la fecha elegida */
    private void validateSpecialDay(ReservationRequestDTO dto) {
        boolean weekend = dto.sessionDate().getDayOfWeek().getValue() >= 6;
        boolean holiday = holidayService.isHoliday(dto.sessionDate());

        SpecialDay expected = holiday ? SpecialDay.HOLIDAY
                           : weekend ? SpecialDay.WEEKEND
                                     : SpecialDay.REGULAR;
        if (dto.specialDay() == null || dto.specialDay() != expected) {
            throw new IllegalArgumentException("SpecialDay mismatch – expected " + expected);
        }
    }

    private String nextCode() {
        return RND.ints(6, 0, ABC.length())
                .mapToObj(ABC::charAt)
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
    }

    private Reservation buildEntity(ReservationRequestDTO dto,
                                    Session s,
                                    PricingService.PricingResult pr,
                                    String code) {

        Client c = clients.get(dto.clientId());

        Reservation r = new Reservation();
        r.setReservationCode(code);
        r.setClient(c);
        r.setSession(s);
        r.setDuration(pr.minutes());
        r.setParticipants(dto.participantsList().size());
        r.setRateType(dto.rateType());
        r.setBasePrice(pr.baseUnit());
        r.setDiscountPercentage(pr.totalDiscPct());   // ← cambio
        r.setFinalPrice(pr.finalPrice());
        r.setParticipantsList(toEntities(dto.participantsList(), r));
        return r;
    }

    private List<Participant> toEntities(List<ParticipantDTO> list, Reservation r) {
        return list.stream()
                .map(p -> new Participant(null, p.fullName(), p.email(), p.birthday(), r))
                .toList();
    }
}
