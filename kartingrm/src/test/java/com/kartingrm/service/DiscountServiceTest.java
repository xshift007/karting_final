package com.kartingrm.service;

import com.kartingrm.service.pricing.DiscountService;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class DiscountServiceTest {

    private final DiscountService svc = new DiscountService();

    @Test
    void groupDiscount() {
        assertThat(svc.groupDiscount(1)).isZero();
        assertThat(svc.groupDiscount(3)).isEqualTo(10);
        assertThat(svc.groupDiscount(7)).isEqualTo(20);
        assertThat(svc.groupDiscount(12)).isEqualTo(30);
    }

    @Test
    void frequentDiscount() {
        assertThat(svc.frequentDiscount(0)).isZero();
        assertThat(svc.frequentDiscount(2)).isEqualTo(10);
        assertThat(svc.frequentDiscount(5)).isEqualTo(20);
        assertThat(svc.frequentDiscount(7)).isEqualTo(30);
    }

    @Test
    void birthdayDiscount() {
        assertThat(svc.birthdayDiscount(4, 0)).isZero();
        assertThat(svc.birthdayDiscount(4, 1)).isEqualTo(12.5);
        assertThat(svc.birthdayDiscount(5, 2)).isEqualTo(20.0);
    }
}
