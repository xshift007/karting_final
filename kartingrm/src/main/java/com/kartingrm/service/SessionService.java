package com.kartingrm.service;

import com.kartingrm.entity.Session;
import com.kartingrm.exception.OverlapException;
import com.kartingrm.repository.ReservationRepository;
import com.kartingrm.repository.SessionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository    sessionRepo;
    private final ReservationRepository reservationRepo;

    public List<Session> weeklyRack(LocalDate monday) {
        return sessionRepo.findBySessionDateBetween(monday, monday.plusDays(6));
    }

    public Session create(Session s) {
        if (s.getId() == null &&
                sessionRepo.existsOverlap(s.getSessionDate(), s.getStartTime(), s.getEndTime())) {
            throw new OverlapException("Ya existe una sesión solapada");
        }
        return sessionRepo.save(s);
    }

    @Transactional
    public void delete(Long id) {
        if (reservationRepo.participantsInSession(id) > 0) {
            throw new IllegalStateException("No se puede eliminar: la sesión tiene reservas");
        }
        sessionRepo.deleteById(id);
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
                    return sessionRepo.save(s);
                });
    }

}

