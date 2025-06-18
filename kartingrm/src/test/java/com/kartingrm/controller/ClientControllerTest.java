package com.kartingrm.controller;

import com.kartingrm.entity.Client;
import com.kartingrm.repository.ClientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
class ClientControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;
    @MockBean ClientRepository repo;

    @Test
    void postAndGet() throws Exception {
        var c = new Client(1L, "Juan Pérez", "juan@p.com", null, null,0,null);
        when(repo.save(any())).thenReturn(c);
        when(repo.findAll()).thenReturn(List.of(c));

        // POST
        mvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(new Client(null,"Juan Pérez","juan@p.com",null,null,0,null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.fullName").value("Juan Pérez"));

        // GET
        mvc.perform(get("/api/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("juan@p.com"));
    }

    @Test
    void putNotFound() throws Exception {
        when(repo.existsById(99L)).thenReturn(false);
        mvc.perform(put("/api/clients/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(new Client(null,"X","x@x",null,null,0,null))))
                .andExpect(status().isNotFound());
    }
}
