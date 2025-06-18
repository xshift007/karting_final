package com.kartingrm.service;

import com.kartingrm.entity.Session;
import com.kartingrm.exception.OverlapException;
import com.kartingrm.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase
class SessionServiceTest {

    @Autowired SessionService service;
    @Autowired SessionRepository repo;

    @BeforeEach
    void cleanRepo() {
        repo.deleteAll();
    }

    @Test
    void createSessionWithoutOverlap() {
        Session s = new Session(null, LocalDate.now(),
                LocalTime.of(15, 0), LocalTime.of(16, 0), 5);

        assertThatCode(() -> service.create(s)).doesNotThrowAnyException();
    }

    @Test
    void throwExceptionWhenOverlapDetected() {
        service.create(new Session(null, LocalDate.now(),
                LocalTime.of(15, 0), LocalTime.of(16, 0), 5));

        Session overlapped = new Session(null, LocalDate.now(),
                LocalTime.of(15, 30), LocalTime.of(16, 30), 5);

        assertThatThrownBy(() -> service.create(overlapped))
                .isInstanceOf(OverlapException.class);
    }
}
