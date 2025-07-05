package com.kartingrm.controller;

import com.kartingrm.dto.SessionAvailabilityDTO;
import com.kartingrm.entity.Session;
import com.kartingrm.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    /* ---------- CRUD básico ---------- */

    @PostMapping
    public Session createSession(@RequestBody Session session) {
        return sessionService.create(session);
    }

    @GetMapping
    public List<Session> getSessions() {
        return sessionService.weeklyRack(LocalDate.now());
    }

    @PutMapping("/{id}")
    public Session updateSession(@PathVariable Long id,
                                 @RequestBody Session session) {
        if (!sessionService.weeklyRack(LocalDate.now()).stream().anyMatch(s -> s.getId().equals(id))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sesión no existe");
        }
        session.setId(id);
        return sessionService.create(session);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /* ---------- Disponibilidad semanal ---------- */
    @GetMapping("/availability")
    public Map<DayOfWeek, List<SessionAvailabilityDTO>> availability(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {

        return sessionService.getAvailability(from, to);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Map<DayOfWeek, List<SessionAvailabilityDTO>>> stream() {
        return sessionService.getAvailabilityStream();
    }
}
