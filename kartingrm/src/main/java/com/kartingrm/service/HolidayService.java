package com.kartingrm.service;

import com.kartingrm.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidays;

    public boolean isHoliday(LocalDate date) {
        return holidays.existsByDate(date);
    }
}
