package com.kartingrm.repository;

import com.kartingrm.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
    // Consultas específicas (por correo, nombre, etc.)
}
