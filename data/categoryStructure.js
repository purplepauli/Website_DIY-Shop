// Zentrale Definition der gültigen Kategorien und ihrer Unterkategorien.
// Quelle: views/partials/header.ejs (Navbar-Dropdown). Wenn dort eine
// Kategorie oder Unterkategorie ergänzt/entfernt wird, muss diese Datei
// angepasst werden, damit validateProducts() konsistent bleibt.
const CATEGORY_STRUCTURE = {
    "Renovierung": [
        "Wandgestaltung",
        "Bodenbeläge",
        "Türen & Fenster",
        "Werkzeuge & Zubehör"
    ],
    "Bau": [
        "Rohbau",
        "Holz & Plattenwerkstoffe",
        "Dachbaustoffe",
        "Dämmung & Isolierung"
    ],
    "Industriehardware": [
        "Verbindungstechnik",
        "Befestigungssysteme",
        "Maschinenteile & Lager",
        "Arbeitsschutz & Betriebsaustattung"
    ],
    "Verschiedene": [
        "Gartenbedarf",
        "Elektro-Installationsmaterial",
        "Sanitärbedarf",
        "Saisonale Angebote & Restposten"
    ]
};

module.exports = CATEGORY_STRUCTURE;