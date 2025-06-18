package com.kartingrm.service;

import com.kartingrm.dto.IncomeByGroupDTO;
import com.kartingrm.dto.IncomeByRateDTO;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    private final EntityManager em;

    public ReportService(EntityManager em) { this.em = em; }

    public List<IncomeByRateDTO> ingresosPorTarifa(LocalDate from, LocalDate to) {
        return em.createQuery("""
            SELECT new com.kartingrm.dto.IncomeByRateDTO(r.rateType,
                       SUM(p.finalAmountInclVat))
            FROM Payment p JOIN p.reservation r
            WHERE p.paymentDate BETWEEN :f AND :t
            GROUP BY r.rateType
        """, IncomeByRateDTO.class)
                .setParameter("f", from.atStartOfDay())
                .setParameter("t", to.atTime(23,59,59))
                .getResultList();
    }

    public List<IncomeByGroupDTO> ingresosPorGrupo(LocalDate f, LocalDate t) {
        return em.createQuery(
                        "SELECT new com.kartingrm.dto.IncomeByGroupDTO("
                                + "CASE "
                                + " WHEN r.participants BETWEEN 1 AND 2 THEN '1-2'"
                                + " WHEN r.participants BETWEEN 3 AND 5 THEN '3-5'"
                                + " WHEN r.participants BETWEEN 6 AND 10 THEN '6-10'"
                                + " ELSE '11+' END, SUM(p.finalAmountInclVat))"
                                + " FROM Payment p JOIN p.reservation r"
                                + " WHERE p.paymentDate BETWEEN :f AND :t"
                                + " GROUP BY CASE "
                                + " WHEN r.participants BETWEEN 1 AND 2 THEN '1-2'"
                                + " WHEN r.participants BETWEEN 3 AND 5 THEN '3-5'"
                                + " WHEN r.participants BETWEEN 6 AND 10 THEN '6-10'"
                                + " ELSE '11+' END",
                        IncomeByGroupDTO.class)
                .setParameter("f", f.atStartOfDay())
                .setParameter("t", t.atTime(23, 59, 59))
                .getResultList();
    }
}
