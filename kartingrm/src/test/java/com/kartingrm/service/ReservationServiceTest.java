package com.kartingrm.service;

import com.kartingrm.dto.ReservationRequestDTO;
import com.kartingrm.dto.ReservationRequestDTO.ParticipantDTO;
import com.kartingrm.entity.*;
import com.kartingrm.repository.ClientRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.time.*;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@AutoConfigureTestDatabase
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ReservationServiceTest {

    @Autowired ReservationService svc;
    @Autowired ClientRepository   clients;

    Client c;

    @BeforeEach
    void init() {
        clients.deleteAll();
        c = clients.save(new Client(null,"Test","t@t.com",null,
                LocalDate.of(2000,1,1),0, LocalDateTime.now()));
    }

    @Test
    void create_and_update_success() {

        List<ParticipantDTO> list2 = List.of(
                new ParticipantDTO("Uno","u@x.com",false),
                new ParticipantDTO("Dos","d@x.com",false));

        ReservationRequestDTO dto1 = new ReservationRequestDTO(
                "R1", c.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(15,0), LocalTime.of(15,30),
                list2, RateType.LAP_10);

        Reservation r = svc.createReservation(dto1);
        assertThat(r.getParticipants()).isEqualTo(2);

        List<ParticipantDTO> list3 = List.of(
                new ParticipantDTO("Uno","u@x.com",false),
                new ParticipantDTO("Dos","d@x.com",false),
                new ParticipantDTO("Tres","t@x.com",false));

        ReservationRequestDTO dto2 = new ReservationRequestDTO(
                "R1", c.getId(),
                r.getSession().getSessionDate(),
                r.getSession().getStartTime(), r.getSession().getEndTime(),
                list3, RateType.LAP_10);

        Reservation updated = svc.update(r.getId(), dto2);
        assertThat(updated.getParticipants()).isEqualTo(3);
    }

    @Test
    void update_capacityExceeded_throws() {

        List<ParticipantDTO> full = java.util.Collections.nCopies(15,
                new ParticipantDTO("P","p@x.com",false));

        ReservationRequestDTO dto1 = new ReservationRequestDTO(
                "R2", c.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(15,0), LocalTime.of(15,30),
                full, RateType.LAP_10);

        Reservation r = svc.createReservation(dto1);

        List<ParticipantDTO> overflow = java.util.Collections.nCopies(16,
                new ParticipantDTO("P","p@x.com",false));

        ReservationRequestDTO dto2 = new ReservationRequestDTO(
                "R2", c.getId(),
                r.getSession().getSessionDate(),
                r.getSession().getStartTime(), r.getSession().getEndTime(),
                overflow, RateType.LAP_10);

        assertThatThrownBy(() -> svc.update(r.getId(), dto2))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Capacidad de la sesión superada");
    }
}
