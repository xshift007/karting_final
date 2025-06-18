package com.kartingrm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "holidays", uniqueConstraints = @UniqueConstraint(columnNames = "date"))
public class Holiday {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)         // YYYY‑MM‑DD
    private LocalDate date;

    @Column(nullable = false)
    private String name;
}
