const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Pfad zur guides.json und products.json (liegt im data-Ordner)
const jsonPath = path.join(__dirname, "../data/guides.json");
const productsJsonPath = path.join(__dirname, "../data/products.json");

// Hilfsfunktion: Liest die JSON-Datei aus und konvertiert sie in ein JS-Objekt
function getGuidesFromDatabase() {
    if (!fs.existsSync(jsonPath)) {
        // Falls die Datei noch gar nicht existiert, leeres Objekt erzeugen
        fs.writeFileSync(jsonPath, JSON.stringify({}), "utf8");
    }
    const rawData = fs.readFileSync(jsonPath, "utf8");
    return JSON.parse(rawData);
}

// Hilfsfunktion: Liest die Produkt-Datenbank aus (zentrale products.json)
function getProductsFromDatabase() {
    if (!fs.existsSync(productsJsonPath)) {
        return [];
    }
    const rawData = fs.readFileSync(productsJsonPath, "utf8");
    return JSON.parse(rawData);
}

// Erzeugt einen URL-freundlichen Slug aus dem Produktnamen (für die /produkte/:id Route)
function slugify(name) {
    return name
        .toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Reichert die im Guide referenzierten Artikelnummern mit den vollen Produktdaten an
function enrichGuideProducts(guide, alleProdukte) {
    const produktMap = new Map(alleProdukte.map(p => [p.artikelnummer, p]));

    const angereichert = (guide.products || []).map(ref => {
        const produkt = produktMap.get(ref.artikelnummer);

        if (!produkt) {
            // Artikelnummer existiert nicht (mehr) in products.json
            console.warn(`Warnung: Produkt ${ref.artikelnummer} nicht in products.json gefunden.`);
            return null;
        }

        return {
            name: produkt.name,
            beschreibung: produkt.beschreibung,
            image: produkt.bilder[0],
            preis_netto: produkt.preis_netto,
            type: ref.type,
            productId: produkt.artikelnummer,
            artikelnummer: produkt.artikelnummer
        };
    }).filter(Boolean); // null-Einträge (nicht gefundene Produkte) entfernen

    return { ...guide, products: angereichert };
}

router.get('/', async (req, res, next) => {
    const alleGuides = getGuidesFromDatabase();
    // Optionaler Query-Parameter, z.B. /guides?category=bauen
    const activeCategory = req.query.category || 'all';
    res.render("guides", { guides: alleGuides, activeCategory });
});

// 2. DYNAMISCHE DETAILSEITE (z.B. /guides/bar-bauen)
router.get('/:id', (req, res) => {
    try {
        const guides = getGuidesFromDatabase();
        const guideId = req.params.id; // Holt das "bar-bauen" aus der URL
        const aktuellerGuide = guides[guideId]; // Sucht den passenden Eintrag im JSON

        // Falls die ID im JSON nicht existiert -> 404 Fehlerseite
        if (!aktuellerGuide) {
            return res.status(404).send("Dieser Projekt-Guide existiert leider noch nicht.");
        }

        // Artikelnummern aus dem Guide mit den vollen Produktdaten aus products.json anreichern
        const alleProdukte = getProductsFromDatabase();
        const guideMitProdukten = enrichGuideProducts(aktuellerGuide, alleProdukte);

        // Rendert die view 'guide-detail.ejs' und übergibt die Daten des einen Guides
        res.render('guide-detail', { guide: guideMitProdukten, backUrl: '/guides', isRatgeber: false });
    } catch (error) {
        console.error("Fehler beim Laden des Guides:", error);
        res.status(500).send("Interner Serverfehler");
    }
});

module.exports = router;