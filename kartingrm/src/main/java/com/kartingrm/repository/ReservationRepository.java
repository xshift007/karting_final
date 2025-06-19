package com.kartingrm.repository;

import com.kartingrm.entity.Reservation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    @Override
    @EntityGraph(attributePaths = {"session", "client"})
    List<Reservation> findAll();

    @Query("""
       SELECT COALESCE(SUM(r.participants),0)
       FROM Reservation r
       WHERE r.session.id = :sessionId
         AND r.status <> com.kartingrm.entity.ReservationStatus.CANCELLED
    """)
    int participantsInSession(Long sessionId);

    boolean existsByReservationCode(String reservationCode);



}


