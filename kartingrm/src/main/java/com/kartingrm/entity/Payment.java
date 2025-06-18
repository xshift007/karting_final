package com.kartingrm.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="reservation_id", nullable=false)
    private Reservation reservation;

    @Column(name="payment_date", nullable=false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name="payment_method")
    private String paymentMethod; // "cash", "card", "online", etc.

    @Column(name="vat_percentage", nullable=false)
    private Double vatPercentage = 19.0; // IVA, por ejemplo, 19%

    @Column(name="vat_amount", nullable=false)
    private Double vatAmount;

    @Column(name="final_amount_incl_vat", nullable=false)
    private Double finalAmountInclVat;
}
