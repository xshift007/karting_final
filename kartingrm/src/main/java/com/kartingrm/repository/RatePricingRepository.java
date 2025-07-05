package com.kartingrm.repository;

import com.kartingrm.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatePricingRepository
        extends JpaRepository<RatePricing, RatePricingId> {}
