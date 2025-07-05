package com.kartingrm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RatePricingId implements Serializable {

    @Enumerated(EnumType.STRING)
    private RateType    rate;

    @Enumerated(EnumType.STRING)
    private DayCategory category;
}
