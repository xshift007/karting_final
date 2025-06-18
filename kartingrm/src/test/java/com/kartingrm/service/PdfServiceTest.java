package com.kartingrm.service;

import com.kartingrm.entity.*;
import com.kartingrm.service.pricing.DiscountService;
import org.junit.jupiter.api.Test;

import java.time.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class PdfServiceTest {

    @Test
    void buildReceipt_nonEmptyBytes() {

        DiscountService disc = new DiscountService();
        var clientRepo       = mock(com.kartingrm.repository.ClientRepository.class);
        PdfService pdf       = new PdfService(disc, new ClientService(clientRepo, null));

        Client c = new Client(1L,"A","a@b.c",null,
                LocalDate.of(2000,1,1),0, LocalDateTime.now());

        Session s = new Session(1L, LocalDate.now(),
                LocalTime.NOON, LocalTime.NOON.plusMinutes(30), 5);

        Reservation r = new Reservation();
        r.setId(1L); r.setReservationCode("X1");
        r.setClient(c); r.setSession(s);
        r.setDuration(30); r.setParticipants(1);
        r.setRateType(RateType.LAP_10);
        r.setBasePrice(15000.); r.setFinalPrice(15000.);
        r.setStatus(ReservationStatus.PENDING); r.setCreatedAt(LocalDateTime.now());

        Participant p = new Participant(null,"Tester","t@e.com",false,r);
        r.getParticipantsList().add(p);

        Payment pay = new Payment(1L,r, LocalDateTime.now(),
                "cash",19.,2850.,17850.);

        byte[] out = pdf.buildReceipt(r, pay);
        assertThat(out).isNotEmpty();
    }
}
