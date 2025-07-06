package com.kartingrm.repository;

import com.kartingrm.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Consultas relacionadas a pagos
    void deleteByReservationId(Long reservationId);   // ⭐️ nuevo
}
