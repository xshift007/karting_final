package com.kartingrm.dto;

import com.kartingrm.service.ClientService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.BeanFactory;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;

public class UniqueEmailValidator
        implements ConstraintValidator<UniqueEmails, ReservationRequestDTO> {

    @Override
    public boolean isValid(ReservationRequestDTO dto,
                           ConstraintValidatorContext ctx) {

        if (dto.participantsList() == null) {
            return true;                       // nada que validar
        }

        /* ---- e-mail del titular (puede repetirse) ----------------- */
        String ownerEmail = null;
        try {
            BeanFactory bf = ctx.unwrap(BeanFactory.class);
            ownerEmail = bf.getBean(ClientService.class)
                    .get(dto.clientId())
                    .getEmail()
                    .toLowerCase();
        } catch (Exception ignored) { /* tests o mock sin bean */ }

        /* ---- lista de e-mails a verificar ------------------------- */
        String finalOwnerEmail = ownerEmail;
        List<String> emails = dto.participantsList().stream()
                .map(ReservationRequestDTO.ParticipantDTO::email)
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .filter(e -> !e.equals(finalOwnerEmail))   // ← excluye titular
                .toList();

        return emails.size() == new HashSet<>(emails).size();
    }
}
