package com.kartingrm.mapper;

import com.kartingrm.dto.*;
import com.kartingrm.entity.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReservationMapper {

    @Mapping(source = "client",  target = "client")
    @Mapping(source = "session", target = "session")
    ReservationResponseDTO toDto(Reservation entity);

    // sub‑mapeos:
    default ClientDTO toClientDTO(com.kartingrm.entity.Client c){
        return new ClientDTO(c.getId(), c.getFullName(), c.getEmail());
    }
    default SessionDTO toSessionDTO(com.kartingrm.entity.Session s){
        return new SessionDTO(s.getId(), s.getSessionDate(),
                s.getStartTime(), s.getEndTime());
    }
}
