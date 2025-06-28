package com.kartingrm.dto;

import com.kartingrm.entity.RateType;

public record IncomeByRateMonthlyDTO(
    String month,
    RateType rate,
    Double total
) {}
