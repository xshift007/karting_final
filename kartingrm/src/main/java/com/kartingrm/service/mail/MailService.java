package com.kartingrm.service.mail;

import com.kartingrm.entity.Participant;
import com.kartingrm.entity.Reservation;
import java.util.Objects;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender sender;

    @Async
    public void sendReceipt(Reservation r, byte[] pdf){
        r.getParticipantsList().stream()
                .map(Participant::getEmail)
                .filter(Objects::nonNull)
                .forEach(e -> send(e, pdf));
    }

    /* ---------- privado ---------- */
    private void send(String to, byte[] pdf){
        try{
            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(mime, true);
            h.setTo(to);
            h.setSubject("Comprobante de Reserva KartingRM");
            h.setText("Adjunto encontrará su comprobante.");
            h.addAttachment("comprobante.pdf", new ByteArrayResource(pdf));
            sender.send(mime);
        }catch (Exception e){
            throw new RuntimeException("Error enviando email", e);
        }
    }

    public void sendConfirmation(Reservation r){
        try{
            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(mime, false, "UTF-8");
            h.setTo(r.getClient().getEmail());
            h.setSubject("Confirmación de reserva " + r.getReservationCode());
            h.setText("""
            ¡Hola %s!

            Tu reserva para el %s a las %s ha sido registrada con éxito.
            Participantes: %d
            Tarifa: %s
            Precio final: %.0f CLP

            Gracias por elegir KartingRM.
            """.formatted(
                    r.getClient().getFullName(),
                    r.getSession().getSessionDate(),
                    r.getSession().getStartTime(),
                    r.getParticipants(),
                    r.getRateType(),
                    r.getFinalPrice()
            ));
            sender.send(mime);
        }catch(Exception e){
            throw new RuntimeException("Error enviando e-mail de confirmación", e);
        }
    }
}
