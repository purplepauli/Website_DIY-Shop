/**
 * Live-Suche / Autocomplete für die globale Suchleiste im Header.
 *
 * Erwartete DOM-Struktur (aus views/partials/header.ejs):
 *   <form class="search-bar">
 *       <input id="searchInput" name="q" ...>
 *       <button type="submit">...</button>
 *       <div id="searchSuggestions" class="search-suggestions" hidden></div>
 *   </form>
 *
 * Verhalten:
 *  - < 2 Zeichen: Dropdown wird ausgeblendet
 *  - >= 2 Zeichen: nach 250ms Debounce wird GET /suche/live?q=... gefetcht
 *  - Dropdown zeigt bis zu 6 Treffer mit Bild, Name, Preis
 *  - Klick außerhalb oder Escape schließt das Dropdown
 *  - Form-Submit (Enter / Suchen-Button) bleibt unverändert (Fallback)
 */
(function () {
    "use strict";

    const input = document.getElementById("searchInput");
    const suggestions = document.getElementById("searchSuggestions");

    // Wenn die globalen Elemente auf dieser Seite nicht existieren, einfach
    // abbrechen - das Skript kann bedenkenlos auf jeder Seite eingebunden
    // werden, ohne dass ein Fehler geworfen wird.
    if (!input || !suggestions) return;

    const form = input.form;
    const DEBOUNCE_MS = 250;
    const MIN_CHARS = 2;
    const MAX_PRICE_DIGITS = 2;

    let debounceTimer = null;
    // Wir merken uns den zuletzt abgeschickten Suchbegriff, um veraltete
    // (langsamere) Antworten zu verwerfen, falls der Nutzer weitertippt.
    let lastFetchedTerm = "";

    /**
     * Leert das Dropdown und blendet es aus.
     */
    function closeDropdown() {
        suggestions.innerHTML = "";
        suggestions.hidden = true;
    }

    /**
     * Blendet das Dropdown ein (Inhalt muss vorher gefüllt worden sein).
     */
    function openDropdown() {
        suggestions.hidden = false;
    }

    /**
     * Formatiert einen Zahlenwert als Euro-Preis mit zwei Nachkommastellen
     * und deutschem Komma als Dezimaltrennzeichen (z. B. 12,99 €).
     * @param {number|string} value - Roh-Preis (z. B. aus pricing.endpreisBrutto)
     * @returns {string} Formatierter Preis-String inkl. €-Symbol.
     */
    function formatPrice(value) {
        const n = Number(value) || 0;
        return n.toFixed(MAX_PRICE_DIGITS).replace(".", ",") + " €";
    }

    /**
     * Erzeugt den "Keine Treffer"-Hinweis, der im leeren Dropdown angezeigt wird.
     * @returns {HTMLDivElement} Container-Element mit dem Hinweistext.
     */
    function buildEmptyState() {
        const empty = document.createElement("div");
        empty.className = "search-suggestion-empty";
        empty.textContent = "Keine Treffer";
        return empty;
    }

    /**
     * Erzeugt einen einzelnen Vorschlagseintrag (Bild + Name + Preis) als
     * klickbaren Link zur Produktdetailseite. Produktnamen werden über
     * textContent gesetzt, damit Sonderzeichen nicht als HTML interpretiert
     * werden.
     * @param {{artikelnummer: string, name: string, bild: string, endpreisBrutto: number|string}} product
     *   Kompaktes Produkt-Objekt aus der /suche/live-JSON-Antwort.
     * @returns {HTMLAnchorElement} Fertiges <a>-Element für das Dropdown.
     */
    function buildSuggestion(product) {
        const link = document.createElement("a");
        link.className = "search-suggestion";
        link.href = "/produkte/" + product.artikelnummer;

        const img = document.createElement("img");
        img.className = "search-suggestion-image";
        img.alt = "";
        img.src = product.bild || "/images/products/no-image.jpg";
        img.onerror = function () {
            // Bei Bildfehler auf den Platzhalter zurückfallen
            img.onerror = null;
            img.src = "/images/products/no-image.jpg";
        };

        const name = document.createElement("span");
        name.className = "search-suggestion-name";
        // textContent statt innerHTML: verhindert versehentliche HTML-
        // Interpretation von Sonderzeichen im Produktnamen.
        name.textContent = product.name;

        const price = document.createElement("span");
        price.className = "search-suggestion-price";
        price.textContent = formatPrice(product.endpreisBrutto);

        link.appendChild(img);
        link.appendChild(name);
        link.appendChild(price);
        return link;
    }

    /**
     * Rendert die übergebene Trefferliste in das Dropdown. Bei einer leeren
     * Liste wird stattdessen der "Keine Treffer"-Hinweis angezeigt.
     * @param {Array<{artikelnummer: string, name: string, bild: string, endpreisBrutto: number|string}>} results
     *   Kompakte Treffer aus der /suche/live-JSON-Antwort.
     */
    function renderResults(results) {
        // Vorherigen Inhalt entfernen
        while (suggestions.firstChild) {
            suggestions.removeChild(suggestions.firstChild);
        }

        if (!results || results.length === 0) {
            suggestions.appendChild(buildEmptyState());
        } else {
            results.forEach(function (product) {
                suggestions.appendChild(buildSuggestion(product));
            });
        }
        openDropdown();
    }

    /**
     * Ruft die /suche/live-Route per fetch() ab und rendert die Antwort.
     * Veraltete Antworten (die nach einer weiteren Nutzereingabe eintreffen)
     * werden verworfen, damit der angezeigte Treffer immer zum aktuellen
     * Suchbegriff passt.
     * @param {string} term - Bereits getrimmter Suchbegriff.
     */
    function performFetch(term) {
        lastFetchedTerm = term;
        fetch("/suche/live?q=" + encodeURIComponent(term), {
            headers: { "Accept": "application/json" }
        })
            .then(function (response) {
                if (!response.ok) throw new Error("HTTP " + response.status);
                return response.json();
            })
            .then(function (payload) {
                // Nur anzeigen, wenn der Nutzer nicht in der Zwischenzeit
                // weitergerippt hat (sonst würde ein veralteter Treffer
                // plötzlich unter dem aktuellen Suchbegriff erscheinen).
                if (term !== input.value.trim()) return;
                renderResults(payload && payload.results ? payload.results : []);
            })
            .catch(function () {
                // Bei Netzwerk-/Serverfehler das Dropdown schließen statt
                // einen veralteten/kaputten Zustand anzuzeigen.
                if (term !== input.value.trim()) return;
                closeDropdown();
            });
    }

    /**
     * Handler für das 'input'-Event des Suchfelds. Setzt den Debounce-Timer
     * (DEBOUNCE_MS) zurück und stößt nach Ablauf den Live-Fetch an, sofern
     * der Suchbegriff mindestens MIN_CHARS Zeichen enthält. Bei weniger
     * Zeichen wird das Dropdown sofort geschlossen.
     */
    function onInput() {
        const term = input.value.trim();

        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        if (term.length < MIN_CHARS) {
            closeDropdown();
            return;
        }

        debounceTimer = setTimeout(function () {
            performFetch(term);
        }, DEBOUNCE_MS);
    }

    /**
     * Handler für das 'keydown'-Event im Suchfeld. Schließt das Dropdown
     * bei Escape, damit der Nutzer es explizit ausblenden kann.
     * @param {KeyboardEvent} e - Das ausgelöste Keyboard-Event.
     */
    function onKeydown(e) {
        if (e.key === "Escape") {
            closeDropdown();
        }
    }

    /**
     * Globaler Click-Handler. Schließt das Dropdown, sobald irgendwo
     * außerhalb des Suchformulars (inkl. Dropdown) geklickt wird.
     * @param {MouseEvent} e - Das ausgelöste Maus-Event.
     */
    function onDocumentClick(e) {
        // Schließen, wenn der Klick weder im Suchfeld noch im Dropdown ist
        if (form && (form.contains(e.target) || suggestions.contains(e.target))) {
            return;
        }
        closeDropdown();
    }

    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onDocumentClick);
})();
