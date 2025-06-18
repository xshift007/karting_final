package com.kartingrm.repository;

import com.kartingrm.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findBySessionDateBetween(LocalDate from, LocalDate to);


    //Consultas por fecha o por intervalo de tiempo si se requieren
    @Query("""
 SELECT count(s) > 0
 FROM Session s
 WHERE s.sessionDate = :date
   AND (:start <  s.endTime AND :end >  s.startTime)
""")
    boolean existsOverlap(LocalDate date, LocalTime start, LocalTime end);


    Optional<Session> findBySessionDateAndStartTimeAndEndTime(
            LocalDate date, LocalTime startTime, LocalTime endTime);
}

