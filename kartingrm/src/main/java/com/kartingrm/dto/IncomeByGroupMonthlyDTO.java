package com.kartingrm.dto;

public record IncomeByGroupMonthlyDTO(
    String month,
    String range,
    Double total
) {}
