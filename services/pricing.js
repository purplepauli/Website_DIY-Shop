/**
 * Rundet auf 2 Nachkommastellen (Cent-genau). Immer erst am Ende einer
 * Berechnung anwenden, nie zwischen Rechenschritten - sonst summieren sich
 * Rundungsfehler.
 */
function round2(value) {
    return Math.round(value * 100) / 100;
}

/**
 * Berechnet den finalen Verkaufspreis (brutto, nach Rabatt) aus preis_netto,
 * steuersatz und discount eines Produkts.
 *
 * Erwartet ein Objekt mit: preis_netto (number), steuersatz (number, z.B. 0.19),
 * discount (number, z.B. 0.25 für 25%).
 */
function calculatePricing({ preis_netto, steuersatz = 0, discount = 0 }) {
    const bruttoPreisVorRabatt = preis_netto * (1 + steuersatz);
    const endpreisBrutto = bruttoPreisVorRabatt * (1 - discount);

    return {
        bruttoPreisVorRabatt: round2(bruttoPreisVorRabatt),
        endpreisBrutto: round2(endpreisBrutto),
        ersparnisBrutto: round2(bruttoPreisVorRabatt - endpreisBrutto),
        hatRabatt: discount > 0
    };
}

module.exports = calculatePricing;