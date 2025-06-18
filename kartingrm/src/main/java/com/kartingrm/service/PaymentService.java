package com.kartingrm.service;

import com.kartingrm.dto.PaymentRequestDTO;
import com.kartingrm.entity.*;
import com.kartingrm.repository.PaymentRepository;
import com.kartingrm.repository.ReservationRepository;
import com.kartingrm.service.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final double VAT_RATE = 0.19;     // 19 %

    private final ReservationRepository reservations;
    private final PaymentRepository     payments;
    private final PdfService            pdf;
    private final MailService           mail;
    private final ClientService         clients;

    /** Registra el pago y, tras commit, envía el comprobante PDF. */
    @Transactional
    public Payment pay(PaymentRequestDTO dto) {

        Reservation r = reservations.findById(dto.reservationId())
                .orElseThrow(() -> new IllegalArgumentException("Reserva no existe"));

        if (r.getStatus() != ReservationStatus.PENDING)
            throw new IllegalStateException("La reserva ya fue pagada o cancelada");

        /* ----------- el precio ya INCLUYE IVA ----------- */
        double gross = r.getFinalPrice();             // p.e. 30 000
        double vat   = gross * VAT_RATE / (1 + VAT_RATE);   // 19 % incluido
        //  = 30 000 × 19 / 119

        Payment p = new Payment();
        p.setReservation(r);
        p.setPaymentMethod(dto.method());
        p.setVatAmount(vat);
        p.setFinalAmountInclVat(gross);
        payments.save(p);

        /* confirma reserva y registra visita */
        r.setStatus(ReservationStatus.CONFIRMED);
        reservations.save(r);
        clients.incrementVisits(r.getClient());

        /* envía recibo una vez confirmada la transacción */
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronizationAdapter() {
                    @Override public void afterCommit() {
                        byte[] pdfBytes = pdf.buildReceipt(r, p);
                        mail.sendReceipt(r, pdfBytes);
                    }
                });

        return p;
    }

    /** PDF ya generado para un pago dado */
    @Transactional(readOnly = true)
    public byte[] generateReceipt(Long paymentId) {

        Payment p = payments.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Pago no existe"));

        // fuerza la carga de participantes
        p.getReservation().getParticipantsList().size();

        return pdf.buildReceipt(p.getReservation(), p);
    }
}
