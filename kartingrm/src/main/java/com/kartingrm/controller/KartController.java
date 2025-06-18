package com.kartingrm.controller;

import com.kartingrm.entity.Kart;
import com.kartingrm.entity.KartStatus;
import com.kartingrm.service.KartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/karts")
@RequiredArgsConstructor
public class KartController {

    private final KartService svc;

    @GetMapping
    public List<Kart> list() { return svc.findAll(); }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<Kart> changeStatus(@PathVariable Long id,
                                             @PathVariable KartStatus status) {
        return ResponseEntity.ok(svc.updateStatus(id, status));
    }
}
