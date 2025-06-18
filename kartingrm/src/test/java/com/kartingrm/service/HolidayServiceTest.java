package com.kartingrm.service;

import com.kartingrm.repository.HolidayRepository;
import org.junit.jupiter.api.*;
import org.mockito.*;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class HolidayServiceTest {

    @Mock HolidayRepository repo;
    HolidayService svc;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
        svc = new HolidayService(repo);
    }

    @Test
    void isHoliday_fixed() {
        LocalDate patrias  = LocalDate.of(2025,9,18);
        LocalDate navidad  = LocalDate.of(2025,12,25);
        LocalDate ordinary = LocalDate.of(2025,1,1);

        when(repo.existsByDate(patrias)).thenReturn(true);
        when(repo.existsByDate(navidad)).thenReturn(true);
        when(repo.existsByDate(ordinary)).thenReturn(false);

        assertThat(svc.isHoliday(patrias)).isTrue();
        assertThat(svc.isHoliday(navidad)).isTrue();
        assertThat(svc.isHoliday(ordinary)).isFalse();
    }
}
