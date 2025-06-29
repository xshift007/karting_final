package com.kartingrm.dto;

public record IncomeByGroupMonthlyDTO(
    Integer month,
    String  range,
    Double total
) {}
