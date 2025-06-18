package com.kartingrm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "reservations")
@NoArgsConstructor @AllArgsConstructor
public class Reservation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_code", nullable = false, unique = true)
    private String reservationCode;

    @ManyToOne @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    // Reservation.java   (cambiar la relación)
// antes: @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;


    /** Duración total (minutos) */
    @Column(nullable = false)
    private Integer duration;

    /** Cantidad de participantes */
    @Column(nullable = false)
    private Integer participants;

    @Enumerated(EnumType.STRING)
    @Column(name = "rate_type", nullable = false)
    private RateType rateType;

    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @Column(name = "discount_percentage")
    private Double discountPercentage = 0.0;

    @Column(name = "final_price", nullable = false)
    private Double finalPrice;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /* >>> NUEVO: lista de integrantes */
    @OneToMany(mappedBy = "reservation",
            cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.EAGER)
    private List<Participant> participantsList = new ArrayList<>();
}
