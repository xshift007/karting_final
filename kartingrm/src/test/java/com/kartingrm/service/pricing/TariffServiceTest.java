package com.kartingrm.service.pricing;

import com.kartingrm.entity.RateType;
import com.kartingrm.entity.TariffConfig;
import com.kartingrm.service.HolidayService;
import com.kartingrm.repository.TariffConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.DayOfWeek;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class TariffServiceTest {

    @Mock TariffConfigRepository repo;
    @Mock HolidayService holidaySvc;
    TariffService svc;

    @BeforeEach void init() {
        MockitoAnnotations.openMocks(this);
        svc = new TariffService(repo, holidaySvc);
    }

    @Test
    void forDate_regularWeekday_returnsBase() {
        var cfg = new TariffConfig(RateType.LAP_10, 100, 30);
        when(holidaySvc.isHoliday(any())).thenReturn(false);
        when(repo.findById(RateType.LAP_10)).thenReturn(java.util.Optional.of(cfg));
        var out = svc.forDate(LocalDate.of(2025,5,14), RateType.LAP_10); // miércoles
        assertThat(out.getPrice()).isEqualTo(100);
        assertThat(out.getMinutes()).isEqualTo(30);
    }

    @Test
    void forDate_weekend_usesWeekendPrice() {
        var base = new TariffConfig(RateType.LAP_15, 200, 35);
        var wknd = new TariffConfig(RateType.WEEKEND, 300, 35);
        when(holidaySvc.isHoliday(any())).thenReturn(false);
        when(repo.findById(RateType.LAP_15)).thenReturn(java.util.Optional.of(base));
        when(repo.findById(RateType.WEEKEND)).thenReturn(java.util.Optional.of(wknd));
        var out = svc.forDate(LocalDate.of(2025,5,17), RateType.LAP_15); // sábado
        assertThat(out.getPrice()).isEqualTo(300);
        assertThat(out.getMinutes()).isEqualTo(35);
        assertThat(out.getRate()).isEqualTo(RateType.LAP_15);
    }

    @Test
    void forDate_holiday_usesHolidayPrice() {
        var base = new TariffConfig(RateType.LAP_20, 250, 40);
        var hol  = new TariffConfig(RateType.HOLIDAY, 400, 40);
        when(holidaySvc.isHoliday(any())).thenReturn(true);
        when(repo.findById(RateType.LAP_20)).thenReturn(java.util.Optional.of(base));
        when(repo.findById(RateType.HOLIDAY)).thenReturn(java.util.Optional.of(hol));
        var out = svc.forDate(LocalDate.of(2025,12,25), RateType.LAP_20);
        assertThat(out.getPrice()).isEqualTo(400);
        assertThat(out.getRate()).isEqualTo(RateType.LAP_20);
    }
}
