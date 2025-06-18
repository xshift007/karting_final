package com.kartingrm.controller;

import com.kartingrm.entity.TariffConfig;
import com.kartingrm.entity.RateType;
import com.kartingrm.repository.TariffConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/tariffs") @RequiredArgsConstructor
public class TariffConfigController {

    private final TariffConfigRepository repo;

    @GetMapping              public List<TariffConfig> findAll()          { return repo.findAll(); }
    @GetMapping("/{rate}")   public TariffConfig get(@PathVariable RateType rate){ return repo.findById(rate).orElseThrow(); }

    @PutMapping("/{rate}")
    @CacheEvict(value = "tariffs",           // <-- borra todas las entradas
            allEntries = true)          //      cada vez que se actualiza algo
    public ResponseEntity<TariffConfig> update(@PathVariable RateType rate,
                                               @RequestBody TariffConfig cfg) {
        if (!repo.existsById(rate)) {
            return ResponseEntity.notFound().build();
        }
        cfg.setRate(rate);                  // aseguramos PK coherente
        return ResponseEntity.ok(repo.save(cfg));
    }
}
