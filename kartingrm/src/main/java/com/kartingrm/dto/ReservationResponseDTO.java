package com.kartingrm.dto;

import com.kartingrm.entity.RateType;
import com.kartingrm.entity.ReservationStatus;

public record ReservationResponseDTO(
        Long id,
        String reservationCode,
        ClientDTO client,
        SessionDTO session,
        Integer participants,
        RateType rateType,
        Double basePrice,
        Double discountPercentage,
        Double finalPrice,
        ReservationStatus status
) {}
