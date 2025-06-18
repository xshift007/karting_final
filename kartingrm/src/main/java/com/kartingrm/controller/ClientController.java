package com.kartingrm.controller;

import com.kartingrm.entity.Client;
import com.kartingrm.repository.ClientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientRepository.save(client);
    }

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }


    /* ---------- NUEVO: actualizar ---------- */
    @PutMapping("/{id}")
    public Client updateClient(@PathVariable Long id,
                               @RequestBody Client client) {
        if (!clientRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no existe");
        }
        client.setId(id);
        return clientRepository.save(client);
    }


}
