package com.kartingrm.service.pricing;

import com.kartingrm.dto.ReservationRequestDTO;
import com.kartingrm.entity.Client;
import com.kartingrm.entity.RatePricing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Orden de aplicación:
 *   1) Descuento por grupo (todos)
 *   2) Descuento cliente frecuente (sólo titular)
 *   3) 50 % para 1 – 2 cumpleañeros elegibles
 */
@Service
@RequiredArgsConstructor
public class PricingService {

    private final TariffService    tariff;
    private final DiscountService  disc;
    private final com.kartingrm.service.ClientService clientSvc;

    public PricingResult calculate(ReservationRequestDTO dto) {

        /* ---------- datos base ---------- */
        RatePricing cfg = tariff.forDate(dto.sessionDate(), dto.rateType(),
                                         dto.holidayOverride());
        double       baseUnit = cfg.getPrice();
        int          minutes  = cfg.getMinutes();
        int          people   = dto.participantsList().size();

        /* ---------- descuentos ---------- */
        double groupPct = disc.groupDiscount(people);

        Client  owner   = clientSvc.get(dto.clientId());
        double  freqPct = disc.frequentDiscount(
                clientSvc.getTotalVisitsThisMonth(owner));

        long    bdays   = dto.participantsList().stream()
                .filter(ReservationRequestDTO.ParticipantDTO::birthday)
                .count();
        int     winners = disc.birthdayWinners(people, (int) bdays);

        /* ---------- tras grupo ---------- */
        double afterGroup = baseUnit * (1 - groupPct / 100);

        double ownerUnit = afterGroup * (1 - freqPct / 100);   // titular
        double regular   = afterGroup;                         // resto

        /* ---------- aplicar 50 % cumpleañero ---------- */
        boolean ownerIsBirthday = dto.participantsList().stream()
                .anyMatch(p -> p.email().equalsIgnoreCase(owner.getEmail()) && p.birthday());

        int winnersLeft = winners;
        if (ownerIsBirthday && winnersLeft > 0) {
            ownerUnit   *= 0.5;
            winnersLeft--;
        }

        double totalOthers =
                regular * (people - 1 - winnersLeft) +
                        regular * 0.5 * winnersLeft;

        double finalPrice   = Math.round(ownerUnit + totalOthers);
        double subtotal     = baseUnit * people;
        double totalDiscPct = (subtotal - finalPrice) * 100 / subtotal;

        return new PricingResult(
                baseUnit, groupPct, freqPct, winners,
                minutes, finalPrice, totalDiscPct);
    }

    /* ---------- resultado ---------- */
    public record PricingResult(
            double baseUnit,
            double groupPct,
            double frequentPctOwner,
            int    birthdayWinners,
            int    minutes,
            double finalPrice,
            double totalDiscPct) { }
}
