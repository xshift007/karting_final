package com.kartingrm.service;

import com.kartingrm.entity.Kart;
import com.kartingrm.entity.KartStatus;
import com.kartingrm.repository.KartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Control básico del estado de los karts.
 * No se asocian a reservas individuales: solo interesa el
 * conteo disponible / reservado.
 */
@Service
@RequiredArgsConstructor
public class KartService {

    private final KartRepository repo;

    public List<Kart> findAll() { return repo.findAll(); }

    /** Reserva <code>n</code> karts disponibles y los marca RESERVED. */
    @Transactional
    public List<Kart> allocate(int n) {

        List<Kart> free = repo.findAll().stream()
                .filter(k -> k.getStatus() == KartStatus.AVAILABLE)
                .limit(n)
                .toList();
        if (free.size() < n)
            throw new IllegalStateException("No hay karts suficientes libres");

        free.forEach(k -> k.setStatus(KartStatus.RESERVED));
        repo.saveAll(free);
        return free;
    }

    /** Libera karts previamente asignados. */
    @Transactional
    public void release(List<Kart> karts){
        karts.forEach(k -> k.setStatus(KartStatus.AVAILABLE));
        repo.saveAll(karts);
    }

    @Transactional
    public Kart updateStatus(Long id, KartStatus status) {
        Kart k = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Kart no existe"));
        k.setStatus(status);
        return repo.save(k);
    }
}
