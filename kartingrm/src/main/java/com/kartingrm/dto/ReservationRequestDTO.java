package com.kartingrm.dto;

import com.kartingrm.entity.RateType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ReservationRequestDTO(

        @NotBlank(message = "El código de reserva no puede estar vacío")
        String reservationCode,

        @NotNull(message = "El ID del cliente es obligatorio")
        Long clientId,

        @NotNull @FutureOrPresent
        LocalDate sessionDate,

        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,

        /* NUEVO: lista de participantes detallados */
        @Size(min = 1, max = 15, message = "Máximo 15 participantes")
        List<@Valid ParticipantDTO> participantsList,

        @NotNull RateType rateType
) {
    @AssertTrue(message = "La hora de término debe ser posterior a la de inicio")
    public boolean isTimeOrder(){ return endTime.isAfter(startTime); }

    /* sub‑record */
    public record ParticipantDTO(
            @NotBlank String fullName,
            @Email String email,
            boolean birthday){}
}
