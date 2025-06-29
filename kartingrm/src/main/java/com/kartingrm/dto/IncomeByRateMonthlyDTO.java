package com.kartingrm.dto;

import com.kartingrm.entity.RateType;

public record IncomeByRateMonthlyDTO(
    Integer month,
    RateType rate,
    Double total
) {}
