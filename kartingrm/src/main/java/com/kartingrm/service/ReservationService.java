package com.kartingrm.service;

import com.kartingrm.dto.ReservationRequestDTO;
import com.kartingrm.dto.ReservationRequestDTO.ParticipantDTO;
import com.kartingrm.entity.Client;
import com.kartingrm.entity.Participant;
import com.kartingrm.entity.Reservation;
import com.kartingrm.entity.Session;
import com.kartingrm.repository.ReservationRepository;
import com.kartingrm.service.mail.MailService;
import com.kartingrm.service.pricing.PricingService;
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

    private final ReservationRepository repo;
    private final ClientService clients;
    private final SessionService sessionService;
    private final PricingService pricing;
    private final MailService mail;

    private static final SecureRandom RND = new SecureRandom();
    private static final String ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Value("${kartingrm.default-session-capacity:15}")
    private int defaultCapacity;

    /* ---------------- crear ------------------------------------------------ */
    @Transactional
    public Reservation createReservation(ReservationRequestDTO dto) {
        // 1) Creamos la sesión si no existe
        Session s = sessionService.createIfAbsent(
                dto.sessionDate(),
                dto.startTime(),
                dto.endTime(),
                defaultCapacity
        );

        // 2) Validamos capacidad
        int already = repo.participantsInSession(s.getId());
        int requested = dto.participantsList().size();
        if (already + requested > s.getCapacity())
            throw new IllegalStateException("Capacidad de la sesión superada");

        // 3) Generamos código único
        String code;
        do { code = nextCode(); } while (repo.existsByReservationCode(code));

        // 4) Calculamos precios, guardamos reserva y enviamos mail
        var pr = pricing.calculate(dto);
        Reservation r = repo.save(buildEntity(dto, s, pr, code));
        //TransactionSynchronizationManager.registerSynchronization(
        //        new TransactionSynchronization() {
        //            @Override public void afterCommit() {
        //               mail.sendConfirmation(r);
        //            }
        //        });
        return r;
    }

    /* ---------------- actualizar ------------------------------------------ */
    @Transactional
    public Reservation update(Long id, ReservationRequestDTO dto) {

        Reservation existing = findById(id);

        if (!existing.getSession().getSessionDate().equals(dto.sessionDate()) ||
                !existing.getSession().getStartTime().equals(dto.startTime()) ||
                !existing.getSession().getEndTime().equals(dto.endTime()))
            throw new IllegalStateException("No se puede cambiar el bloque; cree otra reserva");

        Session s = existing.getSession();
        int already = repo.participantsInSession(s.getId()) - existing.getParticipants();
        int requested = dto.participantsList().size();
        if (already + requested > s.getCapacity())
            throw new IllegalStateException("Capacidad de la sesión superada");

        var pr = pricing.calculate(dto);

        existing.setParticipants(requested);
        existing.setDuration(pr.minutes());
        existing.setBasePrice(pr.baseUnit());
        existing.setDiscountPercentage(pr.totalDiscPct());
        existing.setFinalPrice(pr.finalPrice());
        existing.getParticipantsList().clear();
        existing.getParticipantsList()
                .addAll(toEntities(dto.participantsList(), existing));

        return repo.save(existing);
    }

    /* ---------------- consultas ------------------------------------------- */
    public List<Reservation> findAll() {
        return repo.findAll();
    }

    public Reservation findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no existe"));
    }

    public void save(Reservation r) {
        repo.save(r);
    }

    /* ---------------- helpers privados ------------------------------------ */

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
