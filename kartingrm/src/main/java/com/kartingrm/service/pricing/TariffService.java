package com.kartingrm.service.pricing;

import com.kartingrm.entity.*;
import com.kartingrm.repository.RatePricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Service @RequiredArgsConstructor
public class TariffService {

    private final RatePricingRepository repo;
    private final com.kartingrm.service.HolidayService holidays;

    private DayCategory categorize(LocalDate d, boolean overrideHoliday){
        if (overrideHoliday || holidays.isHoliday(d))             return DayCategory.HOLIDAY;
        if (d.getDayOfWeek()==DayOfWeek.SATURDAY ||
            d.getDayOfWeek()==DayOfWeek.SUNDAY)                   return DayCategory.WEEKEND;
        return DayCategory.WEEKDAY;
    }

    /** API principal */
    public RatePricing forDate(LocalDate date, RateType rate, boolean override){
        DayCategory c = categorize(date, override);
        return repo.findById(new RatePricingId(rate, c))
                   .orElseThrow(() ->
                       new IllegalStateException("Falta precio para "+rate+" / "+c));
    }

    /** Compat. con tests antiguos */
    public RatePricing forDate(LocalDate d, RateType r){
        return forDate(d, r, false);
    }
}
