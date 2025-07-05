package com.kartingrm.dto;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UniqueEmailValidator implements ConstraintValidator<UniqueEmails, ReservationRequestDTO> {
    @Override
    public boolean isValid(ReservationRequestDTO dto, ConstraintValidatorContext context) {
        if (dto.participantsList() == null) {
            return true;
        }
        List<String> emails = dto.participantsList().stream()
                .map(ReservationRequestDTO.ParticipantDTO::email)
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .collect(Collectors.toList());
        return emails.size() == new HashSet<>(emails).size();
    }
}
