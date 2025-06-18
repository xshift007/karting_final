package com.kartingrm.controller;

import com.kartingrm.dto.SessionAvailabilityDTO;
import com.kartingrm.dto.SessionDTO;
import com.kartingrm.entity.Session;
import com.kartingrm.repository.ReservationRepository;
import com.kartingrm.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionRepository      sessionRepository;
    private final ReservationRepository  reservationRepository;

    /* ---------- CRUD básico ---------- */

    @PostMapping
    public Session createSession(@RequestBody Session session) {
        return sessionRepository.save(session);
    }

    @GetMapping
    public List<Session> getSessions() {
        return sessionRepository.findAll();
    }

    @PutMapping("/{id}")
    public Session updateSession(@PathVariable Long id,
                                 @RequestBody Session session) {
        if (!sessionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sesión no existe");
        }
        session.setId(id);
        return sessionRepository.save(session);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        if (!sessionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sessionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /* ---------- Disponibilidad semanal ---------- */
    @GetMapping("/availability")
    public Map<DayOfWeek, List<SessionAvailabilityDTO>> availability(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {

        List<Session> sesiones =
                sessionRepository.findBySessionDateBetween(from, to);

        return sesiones.stream()
                .map(s -> new SessionAvailabilityDTO(
                        s.getId(),
                        s.getSessionDate(),
                        s.getStartTime(),
                        s.getEndTime(),
                        s.getCapacity(),
                        reservationRepository.participantsInSession(s.getId())
                ))
                .collect(Collectors.groupingBy(
                        dto -> dto.sessionDate().getDayOfWeek(),
                        LinkedHashMap::new,
                        Collectors.toList()));
    }
}
