package com.kartingrm.service;

import com.kartingrm.entity.*;
import com.kartingrm.service.pricing.DiscountService;
import com.lowagie.text.*;
import com.lowagie.text.Table;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PdfService {

    private static final double VAT_RATE = 0.19;      // 19 %

    private final DiscountService disc;
    private final ClientService   clientSvc;

    private static Font f(int s, boolean b){
        return FontFactory.getFont(FontFactory.HELVETICA, s, b?Font.BOLD:Font.NORMAL);
    }

    /* ------------------------------------------------------------------ */
    /** Localiza al titular entre los participantes (por e-mail, nombre o
     *  en último término el primero de la lista). */
    private Participant findOwner(Client owner, List<Participant> list){
        return list.stream()
                .filter(p -> p.getEmail() != null &&
                        p.getEmail().equalsIgnoreCase(owner.getEmail()))
                .findFirst()
                .orElseGet(() ->
                        list.stream()
                                .filter(p -> p.getFullName() != null &&
                                        p.getFullName().equalsIgnoreCase(owner.getFullName()))
                                .findFirst()
                                .orElse(list.isEmpty() ? null : list.get(0)));
    }
    /* ------------------------------------------------------------------ */

    /** Precio recibido = **bruto** (incluye IVA) */
    public byte[] buildReceipt(Reservation r, Payment p) {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            /* -------- datos descuento -------- */
            int     people = r.getParticipants();
            Client  owner  = r.getClient();
            int     visits = clientSvc.getTotalVisitsThisMonth(owner);

            double gPct  = disc.groupDiscount(people);
            double fPct  = disc.frequentDiscount(visits);

            List<Participant> list = new ArrayList<>(r.getParticipantsList());
            long  bdays   = list.stream().filter(Participant::isBirthday).count();
            int   winners = disc.birthdayWinners(people, (int) bdays);

            /* -------- PDF -------- */
            Document doc = new Document(PageSize.A4);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            /* cabecera descuentos */
            Table head = new Table(2); head.setWidths(new int[]{2,1});
            Stream.of(new String[][]{
                    {"Grupo",     "%.0f %%".formatted(gPct)},
                    {"Frecuente", "%.0f %%".formatted(fPct)},
                    {"Cumpleaños", winners>0 ? "50,0 %" : "0,0 %"}
            }).forEach(rw -> {
                head.addCell(new Phrase(rw[0], f(9,false)));
                head.addCell(new Phrase(rw[1], f(9,false)));
            });
            doc.add(new Paragraph("Descuentos aplicados:", f(10,true)));
            doc.add(head); doc.add(new Paragraph(" "));

            /* precio unitario BRUTO (incl. IVA) */
            double afterGroup = r.getBasePrice() * (1 - gPct/100);  // bruto
            double ownerUnit  = afterGroup * (1 - fPct/100);        // bruto
            double regular    = afterGroup;                         // bruto

            /* quiénes obtienen 50 % */
            Map<Long,Boolean> winnersMap = new HashMap<>();
            int winnersLeft = winners;

            Participant ownerPart = findOwner(owner, list);

            if (ownerPart!=null && ownerPart.isBirthday() && winnersLeft>0){
                winnersMap.put(ownerPart.getId(), true);
                winnersLeft--;
            }
            for (Participant pt : list){
                if (winnersLeft==0) break;
                if (pt.isBirthday() && !winnersMap.containsKey(pt.getId())){
                    winnersMap.put(pt.getId(), true);
                    winnersLeft--;
                }
            }

            /* tabla detalle */
            Table tbl = new Table(6);
            Stream.of("Cliente","Tarifa","%Descuento",
                            "Subtotal","IVA","Total c/IVA")
                    .forEach(h -> tbl.addCell(new Cell(new Phrase(h, f(9,true)))));

            double netTotal=0, vatTotal=0;

            for (Participant pt : list){

                boolean isOwner  = pt == ownerPart;
                boolean isWinner = Boolean.TRUE.equals(winnersMap.get(pt.getId()));

                double unit = isOwner? ownerUnit : regular;   // bruto
                String pct  = "%.0f".formatted(gPct);
                if (isOwner) pct += " ; %.0f".formatted(fPct);
                if (isWinner){ unit*=0.5; pct += " ; 50"; }
                pct += " %";

                double vat = unit * VAT_RATE / (1 + VAT_RATE);   // 19 % incluido
                double net = unit - vat;

                netTotal += net;
                vatTotal += vat;

                tbl.addCell(pt.getFullName());
                tbl.addCell(String.format("%d", Math.round(r.getBasePrice())));
                tbl.addCell(pct);
                tbl.addCell(String.format("%d", Math.round(net)));
                tbl.addCell(String.format("%d", Math.round(vat)));
                tbl.addCell(String.format("%d", Math.round(unit)));
            }

            doc.add(tbl); doc.add(new Paragraph(" "));

            /* resumen */
            double grossTotal = netTotal + vatTotal;
            doc.add(new Paragraph("Subtotal (sin IVA): %.0f".formatted(netTotal)));
            doc.add(new Paragraph("IVA (19 %%): %.0f".formatted(vatTotal)));
            doc.add(new Paragraph("Precio final grupo (incl. IVA): %.0f"
                    .formatted(grossTotal)));

            doc.close();
            return baos.toByteArray();
        }
        catch (Exception e){
            throw new RuntimeException("Error generando PDF", e);
        }
    }
}
