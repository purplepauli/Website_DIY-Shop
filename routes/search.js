const express = require("express");
const router = express.Router();
const productService = require("../services/productService.js");

/**
 * GET /suche?q=...
 * Serverseitige Produktsuche über Name oder Artikelnummer (case-insensitive,
 * Teilstring-Match). Wird in app.js unter "/suche" gemountet, daher reagiert
 * dieser Router auf GET "/".
 *
 * Hinweis: Der Suchbegriff wird im Header-Formular als `name="q"` übergeben,
 * daher lesen wir hier `req.query.q` (nicht `searchQuery`).
 */
router.get('/', async function (req, res, next) {
    const searchTerm = (req.query.q || "").trim();

    // Bei leerem Suchbegriff (oder nur Leerzeichen) bewusst ein leeres
    // Array liefern, damit das Partial die emptyMessage anzeigt, statt
    // dass die App crasht.
    const products = await productService.searchProducts(searchTerm);

    res.render("search", {
        title: searchTerm
            ? `Suche: "${searchTerm}" - DIY Store`
            : "Suche - DIY Store",
        products,
        searchTerm,
        extraStyles: ['/stylesheets/product-section.css']
    });
});

/**
 * GET /suche/live?q=...
 * Liefert JSON für die Live-Suche / das Autocomplete-Dropdown im Header.
 * Wird vom clientseitigen live-search.js per fetch() aufgerufen und gibt
 * maximal 6 kompakte Treffer zurück (artikelnummer, name, bild, endpreisBrutto).
 *
 * Läuft automatisch unter /suche/live, da dieser Router bereits unter /suche
 * gemountet ist - app.js muss dafür nicht angepasst werden.
 */
router.get("/live", async function (req, res, next) {
    const searchTerm = req.query.q || "";
    const results = await productService.searchProducts(searchTerm);

    const kompakt = results.slice(0, 6).map((product) => ({
        artikelnummer: product.artikelnummer,
        name: product.name,
        bild: product.bilder[0],
        endpreisBrutto: product.pricing.endpreisBrutto
    }));

    res.json({ results: kompakt });
});

module.exports = router;
