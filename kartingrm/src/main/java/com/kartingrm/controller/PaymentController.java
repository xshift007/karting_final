package com.kartingrm.controller;

import com.kartingrm.dto.PaymentRequestDTO;
import com.kartingrm.dto.PaymentResponseDTO;
import com.kartingrm.entity.Payment;
import com.kartingrm.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.HttpHeaders.CONTENT_DISPOSITION;
import static org.springframework.http.MediaType.APPLICATION_PDF;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService svc;

    /* ---------------- POST /api/payments ---------------- */
    @PostMapping
    public ResponseEntity<PaymentResponseDTO> pay(
            @Valid @RequestBody PaymentRequestDTO dto) {

        Payment payment = svc.pay(dto);
        return ResponseEntity.ok(new PaymentResponseDTO(payment.getId()));
    }

    /* ------------- GET /api/payments/{id}/receipt -------- */
    @GetMapping("/{id}/receipt")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id) {

        byte[] pdf = svc.generateReceipt(id);

        return ResponseEntity.ok()
                .header(CONTENT_DISPOSITION, "inline; filename=\"comprobante.pdf\"")
                .contentType(APPLICATION_PDF)
                .body(pdf);
    }
}

