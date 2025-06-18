package com.kartingrm.service;

import com.kartingrm.entity.Kart;
import com.kartingrm.entity.KartStatus;
import com.kartingrm.repository.KartRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@AutoConfigureTestDatabase
class KartServiceTest {

    @Autowired KartService svc;
    @Autowired KartRepository repo;

    @BeforeEach
    void init() {
        repo.deleteAll();
        IntStream.rangeClosed(1, 2)
                .mapToObj(i -> new Kart(null, "K%03d".formatted(i),
                        KartStatus.AVAILABLE, null, null))
                .forEach(repo::save);
    }

    @Test
    void allocate_success() {
        List<Kart> list = svc.allocate(2);
        assertThat(list).allMatch(k -> k.getStatus() == KartStatus.RESERVED);
    }

    @Test
    void allocate_insufficient_throws() {
        assertThatThrownBy(() -> svc.allocate(3))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("No hay karts suficientes libres");
    }

    @Test
    void updateStatus_success_y_noEncontrado() {
        Kart k = repo.findAll().get(0);
        Kart actualizado = svc.updateStatus(k.getId(), KartStatus.MAINTENANCE);
        assertThat(actualizado.getStatus()).isEqualTo(KartStatus.MAINTENANCE);

        assertThatThrownBy(() -> svc.updateStatus(999L, KartStatus.AVAILABLE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Kart no existe");
    }
}
