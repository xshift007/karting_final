package com.kartingrm.repository;

import com.kartingrm.entity.RateType;
import com.kartingrm.entity.TariffConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TariffConfigRepository extends JpaRepository<TariffConfig, RateType> {}
