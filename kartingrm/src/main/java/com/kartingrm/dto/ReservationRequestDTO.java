package com.kartingrm.dto;

import com.kartingrm.entity.RateType;
import com.kartingrm.dto.UniqueEmails;
import com.kartingrm.entity.SpecialDay;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.validation.constraints.AssertTrue;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
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
        SpecialDay specialDay,
        @NotNull RateType rateType
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

    public SpecialDay specialDay(){ return specialDay; }

    /* coherencia weekend / holiday */
    @AssertTrue(message = "SpecialDay no coincide con la fecha")
    public boolean isSpecialDayConsistent(){
        if (specialDay == null) return true;               // retro-compatibilidad
        boolean weekend = sessionDate.getDayOfWeek()==DayOfWeek.SATURDAY
                       || sessionDate.getDayOfWeek()==DayOfWeek.SUNDAY;
        boolean holiday = false; // ⇒ usar HolidayService en Service layer
        SpecialDay real = holiday ? SpecialDay.HOLIDAY :
                         weekend ? SpecialDay.WEEKEND :
                                   SpecialDay.REGULAR;
        return real == specialDay;
    }
}
