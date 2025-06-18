package com.kartingrm.service.pricing;

import com.kartingrm.dto.ReservationRequestDTO;
import com.kartingrm.dto.ReservationRequestDTO.ParticipantDTO;
import com.kartingrm.entity.RateType;
import com.kartingrm.entity.Client;
import com.kartingrm.repository.TariffConfigRepository;
import com.kartingrm.service.HolidayService;
import com.kartingrm.service.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class PricingServiceTest {

    @Mock TariffConfigRepository repo;
    @Mock HolidayService holidaySvc;
    @Mock ClientService clientSvc;
    @InjectMocks TariffService tariffService;
    PricingService pricingSvc;

    @BeforeEach void setup() {
        MockitoAnnotations.openMocks(this);
        // Usa la TariffService real para PricingService
        pricingSvc = new PricingService(tariffService, new DiscountService(), clientSvc);
    }

    @Test
    void calculate_weekday_noDiscounts() {
        // dada una tarifa base de 1000, 1 participante, sin feriado/fin de semana
        var cfg = new com.kartingrm.entity.TariffConfig(RateType.LAP_10, 1000, 30);
        when(holidaySvc.isHoliday(any())).thenReturn(false);
        when(repo.findById(RateType.LAP_10)).thenReturn(java.util.Optional.of(cfg));
        // cliente con 0 visitas
        var client = new Client(1L,"Foo","f@f",null,null,0,null);
        when(clientSvc.get(1L)).thenReturn(client);
        when(clientSvc.getTotalVisitsThisMonth(client)).thenReturn(0);

        var participants = List.of(new ParticipantDTO("X","x@x",false));
        var req = new ReservationRequestDTO("C",1L, LocalDate.now(), LocalTime.NOON, LocalTime.NOON.plusMinutes(30), participants, RateType.LAP_10);

        var res = pricingSvc.calculate(req);

        assertThat(res.baseUnit()).isEqualTo(1000);
        assertThat(res.groupPct()).isZero();
        assertThat(res.frequentPctOwner()).isZero();
        assertThat(res.birthdayWinners()).isZero();
        assertThat(res.finalPrice()).isEqualTo(1000);
    }

    @Test
    void calculate_weekend_groupAndFreq() {
        // simula un fin de semana con 3 participantes y 5 visitas
        when(holidaySvc.isHoliday(any())).thenReturn(false);
        var baseCfg = new com.kartingrm.entity.TariffConfig(RateType.LAP_15, 2000, 35);
        var weekendCfg = new com.kartingrm.entity.TariffConfig(RateType.WEEKEND, 3000, 35);
        when(repo.findById(RateType.LAP_15)).thenReturn(java.util.Optional.of(baseCfg));
        when(repo.findById(RateType.WEEKEND)).thenReturn(java.util.Optional.of(weekendCfg));
        var client = new Client(1L,"Foo","f@f",null,null,0,null);
        when(clientSvc.get(1L)).thenReturn(client);
        when(clientSvc.getTotalVisitsThisMonth(client)).thenReturn(5);

        var parts = List.of(
                new ParticipantDTO("A","a@a",false),
                new ParticipantDTO("B","b@b",false),
                new ParticipantDTO("C","c@c",false)
        );
        var req = new ReservationRequestDTO("R",1L, LocalDate.of(2025,5,17), LocalTime.NOON, LocalTime.NOON.plusMinutes(35), parts, RateType.LAP_15);

        var out = pricingSvc.calculate(req);
        // group=10%, freq=20%, finalPrice = 3000*(1-0.1)*(1-0.2)*3 ≈?
        assertThat(out.groupPct()).isEqualTo(10);
        assertThat(out.frequentPctOwner()).isEqualTo(20);
        assertThat(out.birthdayWinners()).isZero();
        assertThat(out.minutes()).isEqualTo(35);
        assertThat(out.finalPrice()).isPositive();
    }
}
