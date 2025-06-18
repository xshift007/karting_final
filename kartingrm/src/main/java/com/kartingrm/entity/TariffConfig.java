package com.kartingrm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "tariff_config")
public class TariffConfig {

    @Id
    @Enumerated(EnumType.STRING)
    private RateType rate;      // LAP_10, WEEKEND, HOLIDAY …

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private int minutes;        // duración total de la reserva
}
