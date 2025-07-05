package com.kartingrm.controller;

import com.kartingrm.entity.*;
import com.kartingrm.repository.RatePricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rate-pricing")
@RequiredArgsConstructor
public class RatePricingController {

    private final RatePricingRepository repo;

    @GetMapping
    public List<RatePricing> findAll(){
        return repo.findAll();
    }

    @GetMapping("/{rate}/{category}")
    public RatePricing get(@PathVariable RateType rate,
                           @PathVariable DayCategory category){
        return repo.findById(new RatePricingId(rate, category)).orElseThrow();
    }

    @PutMapping("/{rate}/{category}")
    public ResponseEntity<RatePricing> update(@PathVariable RateType rate,
                                              @PathVariable DayCategory category,
                                              @RequestBody RatePricing cfg){
        var id = new RatePricingId(rate, category);
        if(!repo.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        cfg.setId(id);
        return ResponseEntity.ok(repo.save(cfg));
    }
}
