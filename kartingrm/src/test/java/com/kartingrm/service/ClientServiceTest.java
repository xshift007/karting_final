package com.kartingrm.service;

import com.kartingrm.entity.Client;
import com.kartingrm.entity.Visit;
import com.kartingrm.repository.ClientRepository;
import com.kartingrm.repository.VisitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ClientServiceTest {

    @Mock ClientRepository repo;
    @Mock VisitRepository  visitRepo;

    @InjectMocks ClientService svc;

    private Client c;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
        c = new Client(1L,"Nombre","mail@dom.cl",null,
                LocalDate.of(2000,1,1),0, LocalDateTime.now());
    }

    @Test
    void getExistente() {
        when(repo.findById(1L)).thenReturn(Optional.of(c));
        assertThat(svc.get(1L)).isSameAs(c);
    }

    @Test
    void getNoExistente_lanza() {
        when(repo.findById(2L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> svc.get(2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Cliente no existe");
    }

    @Test
    void incrementVisits_y_getTotalVisitsThisMonth() {
        svc.incrementVisits(c);
        verify(visitRepo).save(any(Visit.class));

        when(visitRepo.countByClientAndMonth(eq(1L), anyInt(), anyInt()))
                .thenReturn(4);

        assertThat(svc.getTotalVisitsThisMonth(c)).isEqualTo(4);
    }
}
