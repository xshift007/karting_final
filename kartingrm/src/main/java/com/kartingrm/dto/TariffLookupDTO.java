package com.kartingrm.dto;

import com.kartingrm.entity.SpecialDay;

public record TariffLookupDTO(
        double      price,
        int         minutes,
        SpecialDay  specialDay) {}
