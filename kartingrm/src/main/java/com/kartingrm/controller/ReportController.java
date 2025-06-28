package com.kartingrm.controller;

import com.kartingrm.dto.IncomeByGroupDTO;
import com.kartingrm.dto.IncomeByGroupMonthlyDTO;
import com.kartingrm.dto.IncomeByRateDTO;
import com.kartingrm.dto.IncomeByRateMonthlyDTO;
import com.kartingrm.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reports;

    @GetMapping("/by-rate")
    public List<IncomeByRateDTO> byRate(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to){
        return reports.ingresosPorTarifa(from, to);
    }

    @GetMapping("/by-group")
    public List<IncomeByGroupDTO> byGroup(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to){
        return reports.ingresosPorGrupo(from, to);
    }

    @GetMapping("/by-rate/monthly")
    public List<IncomeByRateMonthlyDTO> byRateMonthly(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to){
        return reports.ingresosPorTarifaMensual(from, to);
    }

    @GetMapping("/by-group/monthly")
    public List<IncomeByGroupMonthlyDTO> byGroupMonthly(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to){
        return reports.ingresosPorGrupoMensual(from, to);
    }

    @GetMapping("/by-rate/csv")
    public ResponseEntity<byte[]> byRateCsv(@RequestParam LocalDate from,
                                            @RequestParam LocalDate to){
        var rows = reports.ingresosPorTarifa(from,to);
        StringBuilder sb = new StringBuilder("rate,total\n");
        rows.forEach(r -> sb.append(r.rate()).append(',').append(r.total()).append('\n'));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=by-rate.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/by-group/csv")
    public ResponseEntity<byte[]> byGroupCsv(@RequestParam LocalDate from,
                                             @RequestParam LocalDate to){
        var rows = reports.ingresosPorGrupo(from,to);
        StringBuilder sb = new StringBuilder("range,total\n");
        rows.forEach(r -> sb.append(r.range()).append(',').append(r.total()).append('\n'));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=by-group.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(sb.toString().getBytes(StandardCharsets.UTF_8));
    }
}
