package com.kartingrm.service.pricing;

import com.kartingrm.entity.RateType;
import com.kartingrm.entity.TariffConfig;
import com.kartingrm.repository.TariffConfigRepository;
import com.kartingrm.entity.SpecialDay;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Obtiene la tarifa aplicable considerando fin de semana o feriado.
 * El precio se sobre-escribe por el especial, pero conserva
 * los minutos correspondientes a la tarifa solicitada.
 */
@Service
@RequiredArgsConstructor
public class TariffService {

    private final TariffConfigRepository repo;
    private final com.kartingrm.service.HolidayService holidays;

    /* ---------- DTO de salida para front ---------- */
    public record TariffResult(TariffConfig cfg, SpecialDay specialDay) {}

    /** Devuelve precio minutos y si aplica WEEKEND / HOLIDAY. */
    public TariffResult resolve(LocalDate date, RateType requested){

        boolean weekend = date.getDayOfWeek() == DayOfWeek.SATURDAY
                       || date.getDayOfWeek() == DayOfWeek.SUNDAY;
        boolean holiday = holidays.isHoliday(date);

        SpecialDay sd = holiday ? SpecialDay.HOLIDAY :
                       weekend ? SpecialDay.WEEKEND :
                                 SpecialDay.REGULAR;

        TariffConfig base = repo.findById(requested).orElseThrow();
        if (sd == SpecialDay.REGULAR)
            return new TariffResult(base, sd);

        RateType surcharge = sd == SpecialDay.HOLIDAY ? RateType.HOLIDAY
                                                      : RateType.WEEKEND;
        TariffConfig extra = repo.findById(surcharge).orElseThrow();
        return new TariffResult(
                new TariffConfig(requested, extra.getPrice(), base.getMinutes()),
                sd);
    }

    /* API previa: mantiene compatibilidad interna */
    public TariffConfig forDate(LocalDate date, RateType requested){
        return resolve(date, requested).cfg();
    }
}
