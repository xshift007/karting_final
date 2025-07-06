package com.kartingrm.controller;

import com.kartingrm.dto.*;
import com.kartingrm.entity.Reservation;
import com.kartingrm.entity.ReservationStatus;
import com.kartingrm.mapper.ReservationMapper;
import com.kartingrm.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationMapper reservationMapper;

    /** Crear reserva */
    @PostMapping
    public ResponseEntity<ReservationResponseDTO> create(
            @Valid @RequestBody ReservationRequestDTO dto) {
        Reservation res = reservationService.createReservation(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationMapper.toDto(res));
    }

    /** Listar todas las reservas */
    @GetMapping
    public List<ReservationResponseDTO> list() {
        return reservationService.findAll()
                .stream()
                .map(reservationMapper::toDto)
                .toList();
    }

    /** Obtener una reserva por id */
    @GetMapping("/{id}")
    public ReservationResponseDTO get(@PathVariable Long id) {
        return reservationMapper.toDto(
                reservationService.findById(id));
    }

    // en ReservationController
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        Reservation r = reservationService.findById(id);
        r.setStatus(ReservationStatus.CANCELLED);
        reservationService.save(r);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ReservationResponseDTO updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequestDTO dto) {
        Reservation updated = reservationService.update(id, dto);
        return reservationMapper.toDto(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.deleteReservation(id);     // usa el nuevo método
        return ResponseEntity.noContent().build();
    }

}
