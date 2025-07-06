package com.kartingrm.controller;

import com.kartingrm.dto.TariffLookupDTO;
import com.kartingrm.entity.RateType;
import com.kartingrm.service.pricing.TariffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController @RequestMapping("/api/tariffs") @RequiredArgsConstructor
public class TariffLookupController {

    private final TariffService tariff;

    @GetMapping("/preview")
    public TariffLookupDTO preview(@RequestParam LocalDate date,
                                   @RequestParam RateType rate){
        var res = tariff.resolve(date, rate);
        return new TariffLookupDTO(
                res.cfg().getPrice(),
                res.cfg().getMinutes(),
                res.specialDay());
    }
}
