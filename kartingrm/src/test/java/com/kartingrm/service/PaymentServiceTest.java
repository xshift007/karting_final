package com.kartingrm.service;

import com.kartingrm.dto.PaymentRequestDTO;
import com.kartingrm.dto.ReservationRequestDTO;
import com.kartingrm.dto.ReservationRequestDTO.ParticipantDTO;
import com.kartingrm.entity.*;
import com.kartingrm.repository.ClientRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.time.*;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase
class PaymentServiceTest {

    @MockBean com.kartingrm.service.mail.MailService mail;  // evita envío real

    @Autowired PaymentService     paySvc;
    @Autowired ReservationService resSvc;
    @Autowired ClientRepository   clients;

    @Test
    void payGeneratesVatAndPdf() {

        Client c = clients.save(new Client(null,"Pago","p@e.com",null,
                LocalDate.of(2000,1,1),0, LocalDateTime.now()));

        List<ParticipantDTO> list = List.of(
                new ParticipantDTO("Pay Tester","pay@test.com",false));

        ReservationRequestDTO dto = new ReservationRequestDTO(
                "P1", c.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(15,0), LocalTime.of(15,30),
                list, null, RateType.LAP_10);

        Reservation r = resSvc.createReservation(dto);
        Payment     p = paySvc.pay(new PaymentRequestDTO(r.getId(), "cash"));

        /* El monto almacenado YA incluye IVA -------------------------- */
        assertThat(p.getFinalAmountInclVat()).isEqualTo(r.getFinalPrice());

        /* IVA guardado debe ser 19 % del bruto dentro del mismo precio */
        assertThat(p.getVatAmount())
                .isCloseTo(r.getFinalPrice() * 19 / 119, within(0.01));
    }
}

