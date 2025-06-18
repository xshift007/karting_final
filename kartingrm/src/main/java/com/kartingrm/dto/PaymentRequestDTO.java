package com.kartingrm.dto;

import jakarta.validation.constraints.NotNull;

public record PaymentRequestDTO(
        @NotNull Long reservationId,
        @NotNull String method          // "cash" | "card" | "online"
) {}
