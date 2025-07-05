package com.kartingrm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rate_pricing")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RatePricing {

    @EmbeddedId
    private RatePricingId id;

    private double price;
    private int    minutes;
}
