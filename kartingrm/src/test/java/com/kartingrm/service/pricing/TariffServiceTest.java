package com.kartingrm.service.pricing;

import com.kartingrm.entity.*;
import com.kartingrm.service.HolidayService;
import com.kartingrm.repository.RatePricingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class TariffServiceTest {

    @Mock RatePricingRepository repo;
    @Mock HolidayService holidaySvc;
    TariffService svc;

    @BeforeEach void init() {
        MockitoAnnotations.openMocks(this);
        svc = new TariffService(repo, holidaySvc);
    }

    @Test
    void forDate_regularWeekday_returnsBase() {
        var cfg = new RatePricing(new RatePricingId(RateType.LAP_10, DayCategory.WEEKDAY),100,30);
        when(holidaySvc.isHoliday(any())).thenReturn(false);
        when(repo.findById(cfg.getId())).thenReturn(java.util.Optional.of(cfg));
        var out = svc.forDate(LocalDate.of(2025,5,14), RateType.LAP_10); // miércoles
        assertThat(out.getPrice()).isEqualTo(100);
        assertThat(out.getMinutes()).isEqualTo(30);
    }

    @Test
    void forDate_weekend_usesWeekendPrice() {
        var rp = new RatePricing(new RatePricingId(RateType.LAP_15, DayCategory.WEEKEND),300,35);
        when(holidaySvc.isHoliday(any())).thenReturn(false);
        when(repo.findById(rp.getId())).thenReturn(java.util.Optional.of(rp));
        var out = svc.forDate(LocalDate.of(2025,5,17), RateType.LAP_15); // sábado
        assertThat(out.getPrice()).isEqualTo(300);
        assertThat(out.getMinutes()).isEqualTo(35);
        assertThat(out.getId().getRate()).isEqualTo(RateType.LAP_15);
    }

    @Test
    void forDate_holiday_usesHolidayPrice() {
        var hol = new RatePricing(new RatePricingId(RateType.LAP_20, DayCategory.HOLIDAY),400,40);
        when(holidaySvc.isHoliday(any())).thenReturn(true);
        when(repo.findById(hol.getId())).thenReturn(java.util.Optional.of(hol));
        var out = svc.forDate(LocalDate.of(2025,12,25), RateType.LAP_20);
        assertThat(out.getPrice()).isEqualTo(400);
        assertThat(out.getId().getRate()).isEqualTo(RateType.LAP_20);

    }

    @Test
    void forDate_overrideUsesHoliday() {
        RatePricing rp = new RatePricing(
              new RatePricingId(RateType.LAP_10, DayCategory.HOLIDAY), 300, 30);
        when(repo.findById(rp.getId())).thenReturn(java.util.Optional.of(rp));
        var out = svc.forDate(LocalDate.of(2025,5,14), RateType.LAP_10, true);
        assertThat(out.getPrice()).isEqualTo(300);
        assertThat(out.getId().getCategory()).isEqualTo(DayCategory.HOLIDAY);
    }
}
