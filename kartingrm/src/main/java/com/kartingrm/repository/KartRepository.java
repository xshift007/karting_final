package com.kartingrm.repository;

import com.kartingrm.entity.Kart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KartRepository extends JpaRepository<Kart, Long> {
    // Métodos de consulta adicionales si son necesarios
}
