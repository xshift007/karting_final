package com.kartingrm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Visita registrada para cálculo de cliente frecuente */
@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "visits")
public class Visit {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "client_id")
    private Client client;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;
}
