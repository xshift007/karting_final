package com.kartingrm.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kartingrm.dto.*;
import com.kartingrm.dto.ReservationRequestDTO.ParticipantDTO;
import com.kartingrm.entity.RateType;
import com.kartingrm.entity.Reservation;
import com.kartingrm.entity.ReservationStatus;
import com.kartingrm.mapper.ReservationMapper;
import com.kartingrm.service.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ReservationController.class,
        excludeAutoConfiguration = {
                DataSourceAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class })
@ActiveProfiles("test")
class ReservationControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ReservationService reservationService;
    @MockBean private ReservationMapper  reservationMapper;

    @Test
    void postValidReservation() throws Exception {

        /* FECHA SIEMPRE VÁLIDA -------------------------------------- */
        LocalDate sessionDate = LocalDate.now().plusDays(1);

        List<ParticipantDTO> participants = List.of(
                new ParticipantDTO("Mario Kart",  "mario@kart.com",  false),
                new ParticipantDTO("Luigi Kart",  "luigi@kart.com",  false));

        ReservationRequestDTO req = new ReservationRequestDTO(
                "C1", 1L,
                sessionDate,
                LocalTime.of(10,0), LocalTime.of(10,30),
                participants,
                null, RateType.LAP_10);

        Reservation saved = new Reservation();
        saved.setId(1L);
        saved.setReservationCode("C1");

        ReservationResponseDTO dto = new ReservationResponseDTO(
                1L,"C1",
                new ClientDTO(1L,"Test User","test@example.com"),
                new SessionDTO(1L, sessionDate,
                        LocalTime.of(10,0), LocalTime.of(10,30)),
                participants.size(),
                RateType.LAP_10,
                15000.,0.,15000., ReservationStatus.PENDING);

        when(reservationService.createReservation(any())).thenReturn(saved);
        when(reservationMapper.toDto(saved)).thenReturn(dto);

        mvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reservationCode").value("C1"))
                .andExpect(jsonPath("$.participants").value(2));
    }
}
