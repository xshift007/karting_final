package com.kartingrm.service;

import com.kartingrm.dto.*;
import jakarta.persistence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.time.LocalDate;
import java.util.List;
import jakarta.persistence.TypedQuery;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportServiceTest {

    @Mock EntityManager em;
    @Mock TypedQuery<IncomeByRateDTO> qr;
    @Mock TypedQuery<IncomeByGroupDTO> qg;
    @InjectMocks ReportService svc;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void ingresosPorTarifa_delegatesToEntityManager() {
        when(em.createQuery(anyString(), eq(IncomeByRateDTO.class))).thenReturn(qr);
        when(qr.setParameter(anyString(), any())).thenReturn(qr);
        when(qr.getResultList()).thenReturn(List.of(new IncomeByRateDTO(null, 100.)));
        var res = svc.ingresosPorTarifa(LocalDate.now(), LocalDate.now());
        assertThat(res).hasSize(1)
                .first().extracting(IncomeByRateDTO::total).isEqualTo(100.);
    }

    @Test
    void ingresosPorGrupo_delegatesToEntityManager() {
        when(em.createQuery(anyString(), eq(IncomeByGroupDTO.class))).thenReturn(qg);
        when(qg.setParameter(anyString(), any())).thenReturn(qg);
        when(qg.getResultList()).thenReturn(List.of(new IncomeByGroupDTO("1-2", 200.)));
        var res = svc.ingresosPorGrupo(LocalDate.now(), LocalDate.now());
        assertThat(res).hasSize(1)
                .first().extracting(IncomeByGroupDTO::total).isEqualTo(200.);
    }
}
