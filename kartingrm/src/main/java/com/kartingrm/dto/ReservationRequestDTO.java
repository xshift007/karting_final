package com.kartingrm.dto;

import com.kartingrm.entity.RateType;
import com.kartingrm.dto.UniqueEmails;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.validation.constraints.AssertTrue;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@UniqueEmails
public record ReservationRequestDTO(

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

        @NotNull RateType rateType,
        boolean holidayOverride      // ← NUEVO (default = false)
) {
    @AssertTrue(message = "La hora de término debe ser posterior a la de inicio")
    public boolean isTimeOrder(){ return endTime.isAfter(startTime); }

    @AssertTrue(message = "La hora de inicio no puede ser en el pasado")
    public boolean isTimeInFuture(){
        if (sessionDate.isEqual(LocalDate.now())) {
            return startTime.isAfter(LocalTime.now());
        }
        return true;
    }

    @AssertTrue(message = "La hora de finalización no puede ser después de las 22:00")
    public boolean isEndTimeValid() {
        return !endTime.isAfter(LocalTime.of(22, 0));
    }

    /* sub‑record */
    public record ParticipantDTO(
            @NotBlank String fullName,
            @Email String email,
            boolean birthday){}
}
