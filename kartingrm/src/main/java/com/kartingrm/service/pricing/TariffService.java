package com.kartingrm.service.pricing;

import com.kartingrm.entity.RateType;
import com.kartingrm.entity.TariffConfig;
import com.kartingrm.repository.TariffConfigRepository;
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

    public TariffConfig forDate(LocalDate date, RateType requested){

        boolean weekend = date.getDayOfWeek() == DayOfWeek.SATURDAY
                || date.getDayOfWeek() == DayOfWeek.SUNDAY;
        boolean holiday = holidays.isHoliday(date);

        if (!weekend && !holiday)
            return repo.findById(requested).orElseThrow();

        RateType special = holiday ? RateType.HOLIDAY : RateType.WEEKEND;
        TariffConfig base       = repo.findById(requested).orElseThrow();
        TariffConfig specialCfg = repo.findById(special).orElseThrow();

        /* mismo rate - distinto precio */
        return new TariffConfig(requested, specialCfg.getPrice(), base.getMinutes());
    }
}
