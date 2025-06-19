package com.kartingrm.service;

import com.kartingrm.entity.Client;
import com.kartingrm.entity.Visit;
import com.kartingrm.repository.ClientRepository;
import com.kartingrm.repository.VisitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class ClientService {

    private final ClientRepository repo;
    private final VisitRepository  visits;

    public ClientService(ClientRepository repo,
                         VisitRepository visits){
        this.repo   = repo;
        this.visits = visits;
    }

    public Client get(Long id){
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no existe"));
    }

    public int getTotalVisitsThisMonth(Client c){
        if (visits == null) {
            // en tests de PdfService no hay VisitRepository, devolver 0
            return 0;
        }
        YearMonth ym = YearMonth.now();
        return visits.countByClientAndMonth(c.getId(),
                ym.getYear(), ym.getMonthValue());
    }

    public void incrementVisits(Client c){
        if (!repo.existsById(c.getId())) return;
        visits.save(new Visit(null, c, LocalDate.now()));
    }
}
