package com.kartingrm.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO específico para el endpoint GET /api/sessions/availability
 * Incluye la capacidad de la sesión y la cantidad ya reservada.
 */
public record SessionAvailabilityDTO(
        Long       id,
        LocalDate  sessionDate,
        LocalTime  startTime,
        LocalTime  endTime,
        Integer    capacity,
        Integer    participantsCount
) {}
