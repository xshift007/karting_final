package com.kartingrm.service;

import com.kartingrm.dto.SessionAvailabilityDTO;
import com.kartingrm.entity.Session;
import com.kartingrm.exception.OverlapException;
import com.kartingrm.repository.ReservationRepository;
import com.kartingrm.repository.SessionRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository    sessionRepo;
    private final ReservationRepository reservationRepo;
    private Sinks.Many<Map<DayOfWeek, List<SessionAvailabilityDTO>>> sink;

    @PostConstruct
    public void init() {
        sink = Sinks.many().multicast().onBackpressureBuffer();
    }

    public void notifyAvailabilityUpdate() {
        LocalDate monday = LocalDate.now().with(DayOfWeek.MONDAY);
        Map<DayOfWeek, List<SessionAvailabilityDTO>> availability =
                getAvailability(monday, monday.plusDays(6));
        sink.tryEmitNext(availability);
    }

    public Flux<Map<DayOfWeek, List<SessionAvailabilityDTO>>> getAvailabilityStream() {
        return sink.asFlux();
    }

    public Map<DayOfWeek, List<SessionAvailabilityDTO>> getAvailability(LocalDate from, LocalDate to) {
        List<Session> sessions = sessionRepo.findBySessionDateBetween(from, to);
        return sessions.stream()
                .map(s -> new SessionAvailabilityDTO(
                        s.getId(),
                        s.getSessionDate(),
                        s.getStartTime(),
                        s.getEndTime(),
                        s.getCapacity(),
                        reservationRepo.participantsInSession(s.getId())
                ))
                .collect(Collectors.groupingBy(
                        dto -> dto.sessionDate().getDayOfWeek()
                ));
    }

    public List<Session> weeklyRack(LocalDate monday) {
        return sessionRepo.findBySessionDateBetween(monday, monday.plusDays(6));
    }

    public Session create(Session s) {
        if (s.getId() == null &&
            sessionRepo.existsOverlap(s.getSessionDate(), s.getStartTime(), s.getEndTime())) {
            throw new OverlapException("Ya existe una sesión solapada");
        }
        Session saved = sessionRepo.save(s);
        notifyAvailabilityUpdate();
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        if (reservationRepo.participantsInSession(id) > 0) {
            throw new IllegalStateException("No se puede eliminar: la sesión tiene reservas");
        }
        sessionRepo.deleteById(id);
        notifyAvailabilityUpdate();
    }

    @Transactional
    public Session createIfAbsent(LocalDate date,
                                  LocalTime startTime,
                                  LocalTime endTime,
                                  int capacity) {
        return sessionRepo
                .findBySessionDateAndStartTimeAndEndTime(date, startTime, endTime)
                .orElseGet(() -> {
                    Session s = new Session();    // constructor sin args
                    s.setSessionDate(date);
                    s.setStartTime(startTime);
                    s.setEndTime(endTime);
                    s.setCapacity(capacity);
                    Session saved = sessionRepo.save(s);
                    notifyAvailabilityUpdate();
                    return saved;
                });
    }

}

