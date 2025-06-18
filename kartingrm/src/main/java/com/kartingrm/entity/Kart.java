package com.kartingrm.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "karts")
@NoArgsConstructor
@AllArgsConstructor
public class Kart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // "K001", "K002", …, "K015"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KartStatus status; // AVAILABLE, MAINTENANCE, RESERVED

    private LocalDate lastMaintenance;
    private LocalDate nextMaintenance;
}
