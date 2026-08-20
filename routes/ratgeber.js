const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const jsonPath = path.join(__dirname, "../data/ratgeber.json");
const productsJsonPath = path.join(__dirname, "../data/products.json");

function getRatgeberFromDatabaseOld() {
    if (!fs.existsSync(jsonPath)) {
        fs.writeFileSync(jsonPath, JSON.stringify({}), "utf8");
    }
    const rawData = fs.readFileSync(jsonPath, "utf8");
    return JSON.parse(rawData);
}

function getProductsFromDatabase() {
    if (!fs.existsSync(productsJsonPath)) {
        return [];
    }
    const rawData = fs.readFileSync(productsJsonPath, "utf8");
    return JSON.parse(rawData);
}

function getRatgeberFromDatabase() {
    const models = require("../services/models");
    const res = models.getAll("safety");
    console.log(res);
    return res.data;
}

function slugify(name) {
    return name
        .toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function enrichProducts(guide, alleProdukte) {
    const produktMap = new Map(alleProdukte.map(p => [p.artikelnummer, p]));
    const angereichert = (guide.products || []).map(ref => {
        const produkt = produktMap.get(ref.artikelnummer);
        if (!produkt) {
            console.warn(`Warnung: Produkt ${ref.artikelnummer} nicht in products.json gefunden.`);
            return null;
        }
        return {
            name: produkt.name,
            beschreibung: produkt.beschreibung,
            image: produkt.bild_pfad,
            preis_netto: produkt.preis_netto,
            type: ref.type,
            productId: slugify(produkt.name),
            artikelnummer: produkt.artikelnummer
        };
    }).filter(Boolean);
    return { ...guide, products: angereichert };
}

// Übersichtsseite
router.get('/', (req, res, next) => {
    const alleRatgeber = getRatgeberFromDatabase();
    res.render("ratgeber", { ratgeber: alleRatgeber });
});

// Detailseite (z.B. /ratgeber/persoenliche-schutzausruestung)
router.get('/:id', (req, res) => {
    try {
        const ratgeber = getRatgeberFromDatabase();
        const ratgeberId = req.params.id;
        const aktuellerRatgeber = ratgeber[ratgeberId];

        if (!aktuellerRatgeber) {
            return res.status(404).send("Dieser Ratgeber existiert leider noch nicht.");
        }

        const alleProdukte = getProductsFromDatabase();
        const ratgeberMitProdukten = enrichProducts(aktuellerRatgeber, alleProdukte);

        // Nutzt dieselbe guide-detail.ejs wie die Projektguides
        res.render('guide-detail', { guide: ratgeberMitProdukten, backUrl: '/ratgeber', isRatgeber: true });
    } catch (error) {
        console.error("Fehler beim Laden des Ratgebers:", error);
        res.status(500).send("Interner Serverfehler");
    }
});

module.exports = router;
