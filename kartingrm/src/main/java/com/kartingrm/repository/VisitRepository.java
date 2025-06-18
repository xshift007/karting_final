package com.kartingrm.repository;

import com.kartingrm.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VisitRepository extends JpaRepository<Visit, Long> {

    @Query("""
           SELECT COUNT(v) FROM Visit v
           WHERE v.client.id = :clientId
             AND YEAR(v.visitDate)  = :year
             AND MONTH(v.visitDate) = :month
           """)
    int countByClientAndMonth(Long clientId, int year, int month);
}
