const fs = require("fs/promises");
const path = require("path");
const calculatePricing = require("./pricing.js");
const CATEGORY_STRUCTURE = require("../data/categoryStructure.js");

// __dirname statt relativem Pfad -> unabhängig davon, von wo aus der
// node-Prozess gestartet wird
const PRODUCT_PATH = path.join(__dirname, "..", "data", "products.json");

/**
 * Diagnose-Funktion: prüft eine bereits eingelesene (und mit Pricing
 * angereicherte) Produktliste auf Plausibilität und meldet Auffälligkeiten
 * über console.warn. Reine Diagnose - wirft nie einen Fehler, verändert
 * die übergebene Liste nicht und beeinflusst damit den Rückgabewert von
 * getAllProducts() nicht. Die Anwendung läuft in jedem Fall normal weiter.
 */
function validateProducts(products) {
    if (!Array.isArray(products)) return;

    const seenArtikelnummern = new Set();

    products.forEach((product, index) => {
        // Hilfs-Kontext für jede Warnung: artikelnummer, sonst Fallback,
        // damit man das fehlerhafte Produkt in products.json schnell findet.
        const artNr = (product && typeof product.artikelnummer === "string" && product.artikelnummer.trim() !== "")
            ? product.artikelnummer
            : "(keine Artikelnummer)";
        const context = `[${artNr}] (Index ${index})`;

        // (a) Pflichtfelder vorhanden (nicht undefined/null/leerer String)
        const pflichtfelder = ["artikelnummer", "name", "kategorie", "preis_netto", "steuersatz"];
        pflichtfelder.forEach((feld) => {
            const wert = product ? product[feld] : undefined;
            if (wert === undefined || wert === null || wert === "") {
                console.warn(`validateProducts: Pflichtfeld "${feld}" fehlt/leer ${context}`);
            }
        });

        // (b) artikelnummer-Eindeutigkeit: getProductById() nutzt .find(),
        // bei Duplikaten wäre das zweite Produkt nie erreichbar.
        if (typeof product.artikelnummer === "string" && product.artikelnummer.trim() !== "") {
            if (seenArtikelnummern.has(product.artikelnummer)) {
                console.warn(`validateProducts: Doppelte artikelnummer "${product.artikelnummer}" ${context} - getProductById() würde per .find() nur das erste Produkt liefern`);
            } else {
                seenArtikelnummern.add(product.artikelnummer);
            }
        }

        // (c) Typen prüfen - String wie "0,25" statt number 0.25 ist ein
        // bekannter Fehlerfall aus der Vergangenheit.
        ["preis_netto", "steuersatz", "discount"].forEach((feld) => {
            if (product && product[feld] !== undefined && product[feld] !== null && typeof product[feld] !== "number") {
                console.warn(`validateProducts: Feld "${feld}" hat Typ ${typeof product[feld]} statt number ${context} - Wert: ${JSON.stringify(product[feld])}`);
            }
        });

        // (d) Plausible Wertebereiche - nur prüfen, wenn der Typ number ist,
        // sonst wäre die Bereichsprüfung ohnehin aussagelos.
        if (typeof product.discount === "number") {
            if (product.discount < 0 || product.discount >= 1) {
                console.warn(`validateProducts: discount=${product.discount} außerhalb [0,1) ${context}`);
            }
        }
        if (typeof product.steuersatz === "number") {
            if (product.steuersatz < 0 || product.steuersatz > 1) {
                console.warn(`validateProducts: steuersatz=${product.steuersatz} außerhalb [0,1] ${context}`);
            }
        }
        if (typeof product.preis_netto === "number") {
            if (product.preis_netto <= 0) {
                console.warn(`validateProducts: preis_netto=${product.preis_netto} nicht > 0 ${context}`);
            }
        }

        // (e) varianten und bilder müssen nicht-leere Arrays sein
        if (!Array.isArray(product.varianten) || product.varianten.length === 0) {
            console.warn(`validateProducts: varianten fehlt/leer/kein Array ${context}`);
        }
        if (!Array.isArray(product.bilder) || product.bilder.length === 0) {
            console.warn(`validateProducts: bilder fehlt/leer/kein Array ${context}`);
        }

        // (f) Kategorie / Unterkategorie gegen CATEGORY_STRUCTURE prüfen
        if (product && product.kategorie !== undefined && product.kategorie !== null && product.kategorie !== "") {
            if (!Object.prototype.hasOwnProperty.call(CATEGORY_STRUCTURE, product.kategorie)) {
                console.warn(`validateProducts: Unbekannte Kategorie "${product.kategorie}" ${context}`);
            } else if (product.unterkategorie !== undefined && product.unterkategorie !== null && product.unterkategorie !== "") {
                const erlaubte = CATEGORY_STRUCTURE[product.kategorie];
                if (!erlaubte.includes(product.unterkategorie)) {
                    console.warn(`validateProducts: Unterkategorie "${product.unterkategorie}" passt nicht zu Kategorie "${product.kategorie}" ${context} - erlaubt: ${erlaubte.join(", ")}`);
                }
            }
        }
    });
}



/**
 * Liest die zentrale products.json ein (ein Array mit allen Produkten).
 */
async function getAllProducts() {
    try {
        const content = await fs.readFile(PRODUCT_PATH, "utf-8");
        const products = JSON.parse(content);

        // mappe jedes Produkt auf ein neues Objekt, das zusätzlich mit den neu berechneten Preisen angereichert ist.
        // Die Berechnung erfolgt in services/pricing.js.
        const enriched = products.map((product) => ({
            ...product,
            pricing: calculatePricing(product),


        // Preis PRO Variante -> für die Detail-View mit Variantenauswahl.
        // steuersatz/discount kommen vom Produkt (gelten für alle Varianten gleich),
        // nur netto_preis unterscheidet sich je Variante.

            varianten: product.varianten.map((variante) => ({
                ...variante,
                pricing: calculatePricing({
                    preis_netto: variante.netto_preis,
                    steuersatz: product.steuersatz,
                    discount: product.discount
                })
            }))
        }));

        // Diagnose: Inkonsistenzen in die Konsole warnen, ohne den Ladevorgang
        // abzubrechen. validateProducts() ändert `enriched` nicht und liefert
        // keinen Rückgabewert - Fehler werden ausschließlich geloggt.
        validateProducts(enriched);

        return enriched;

    } catch (err) {
        console.error("Error reading/parsing products.json:", err);
        return [];
    }
}

/**
 * Findet ein einzelnes Produkt anhand seiner Artikelnummer.
 * Gibt undefined zurück, wenn nichts gefunden wurde.
 */
async function getProductById(id) {
    const products = await getAllProducts();
    return products.find((product) => product.artikelnummer === id);
}

/**
 * Filtert Produkte, die im Angebot sind (discount > 0). Wird für die Startseite verwendet.
 */
async function getAngebotsProdukte() {
    const products = await getAllProducts();
    return products.filter((product) => product.pricing.hatRabatt);
}

/**
 * Distinct-Liste aller Kategorien (für das Filter-Dropdown auf /produkte).
 * "Sicherheitsratgeber" ist kein echter Kategoriewert, sondern ein bekannter
 * Datenfehler in den Produktdaten (wird separat behoben) und wird daher
 * hier herausgefiltert.
 */
async function getDistinctCategories() {
    const products = await getAllProducts();
    const alle = products.map((product) => product.kategorie);
    return [...new Set(alle)].filter((cat) => cat !== "Sicherheitsratgeber");
}

/**
 * Filtert und sortiert eine bereits geladene Produktliste nach Kategorie und
 * Sortierkriterium. Lädt selbst keine Daten - der Aufrufer entscheidet, welche
 * Ausgangsliste übergeben wird (alle Produkte, nur Angebote, ...). Dadurch
 * bleibt die Funktion generisch und wiederverwendbar.
 *
 * Preis-Sortierung nutzt pricing.endpreisBrutto (der tatsächlich angezeigte,
 * ggf. rabattierte Bruttopreis) - nicht den Nettopreis vor Rabatt/Steuer.
 */
function filterAndSortProducts(products, { category, subcategory, sort } = {}) {
    let result = !category || category === "alle"
        ? products
        : products.filter((p) => p.kategorie === category);
    
    if (subcategory && subcategory !== "alle") {
        result = result.filter((p) => p.unterkategorie === subcategory);
    }

    result = result.slice().sort((a, b) => {
        switch (sort) {
            case "price_asc":
                return a.pricing.endpreisBrutto - b.pricing.endpreisBrutto;
            case "price_desc":
                return b.pricing.endpreisBrutto - a.pricing.endpreisBrutto;
            case "name_desc":
                return b.name.localeCompare(a.name, "de");
            case "name_asc":
            default:
                return a.name.localeCompare(b.name, "de");
        }
    });

    return result;
}

/**
 * Sucht Produkte anhand eines Suchbegriffs.
 * Geprüft wird case-insensitive und mit Teilstring-Match gegen
 * `name` und `artikelnummer`. Bei leerem Suchbegriff wird ein leeres
 * Array zurückgegeben (keine Fehler/Abstürze).
 */
async function searchProducts(term) {
    if (!term || term.trim() === "") return [];

    const normalisiert = term.trim().toLowerCase();
    const products = await getAllProducts();

    return products.filter((product) =>
        product.name.toLowerCase().includes(normalisiert) ||
        product.artikelnummer.toLowerCase().includes(normalisiert)
    );
}

/**
 * Wählt zufällig `anzahl` Produkte aus einer beliebigen übergebenen Liste aus,
 * ohne Duplikate. Kennt selbst keine Angebote/Kategorien o.ä. - reine
 * Hilfsfunktion, die auf jeder Produktliste funktioniert.
 * Gibt weniger als `anzahl` zurück, falls die Liste kürzer ist
 * (kein Fehler, einfach die vorhandene Menge).
 */
function pickRandomProducts(products, anzahl = 4) {
    // Fisher-Yates-Shuffle: mischt das Array an Ort und Stelle, jede
    // Reihenfolge ist gleich wahrscheinlich. Arbeitet auf einer Kopie
    // (.slice()), damit die übergebene Liste unangetastet bleibt.
    const gemischt = products.slice();
    for (let i = gemischt.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
    }
    // slice() gibt bei weniger als `anzahl` Elementen einfach das ganze
    // Array zurück, statt einen Fehler zu werfen.
    return gemischt.slice(0, anzahl);
}

module.exports = {
    getAllProducts,
    getProductById,
    getAngebotsProdukte,
    getDistinctCategories,
    filterAndSortProducts,
    pickRandomProducts,
    searchProducts
};
