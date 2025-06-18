package com.kartingrm.service.pricing;

import org.springframework.stereotype.Service;

@Service
public class DiscountService {

    /* -------- % por tamaño de grupo -------- */
    public double groupDiscount(int participants) {
        return participants <= 2 ? 0 :
                participants <= 5 ? 10 :
                        participants <=10 ? 20 : 30;
    }

    /* -------- % cliente frecuente (solo titular) -------- */
    public double frequentDiscount(int monthlyVisits) {
        return monthlyVisits >= 7 ? 30 :
                monthlyVisits >= 5 ? 20 :
                        monthlyVisits >= 2 ? 10 : 0;
    }

    /* -------- número de cumpleañeros con 50 % ---------- */
    public int birthdayWinners(int participants, int birthdayPeople) {

        if (participants < 3 || birthdayPeople == 0) return 0;

        if (participants <= 5) {
            // grupos 3-5 ⇒ 1 ganador como máximo
            return 1;
        }
        // grupos 6-15 ⇒ hasta 2 ganadores
        return Math.min(2, birthdayPeople);
    }

    /* -------- % equivalente (compatibilidad tests antiguos) */
    public double birthdayDiscount(int participants, int birthdayPeople) {
        if (participants <= 0 || birthdayPeople <= 0) {
            return 0.0;
        }
        // si hay más cumpleañeros que participantes, los limitamos a 'participants'
        int winners = Math.min(birthdayPeople, participants);
        return winners * 50.0 / participants;
    }
}
