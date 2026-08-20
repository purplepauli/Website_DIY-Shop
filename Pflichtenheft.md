# Pflichtenheft: Handwerksbedarf Online - DIY Store Würzburg

**Modul:** WebApp-SS26  
**Autoren:** Kevin Holzmeister, Pauline Friedrich, 

## 1. Zielbestimmung
Ziel ist die Entwicklung eines Webshops zur strukturierten Darstellung und Verwaltung von Produkten wie Werkzeugen und Materialien, zur Pflege von Ratgeberseiten sowie die Bereitstellung einer REST-API für externe Multichannel-Nutzung.

## 2. Systemarchitektur und Technologie-Stack
Die Anwendung wird als Webanwendung mit Client-Server-Architektur umgesetzt. Gemäß den Vorgaben wird auf externe CMS- oder API-Baukästen verzichtet. Die Implementierung erfolgt eigenständig ("from scratch") in einer einfachen Form.

* **Frontend:** HTML5, CSS3, Bootstrap, JavaScript
* **Backend:** Node.js mit Express.js, JWT (JSON Web Tokens)
* **Templating:** EJS (Embedded JavaScript)
* **Datenaustausch:** JSON für REST-API-Kommunikation
* **Datenbank:** JSON (Speicherung von Produktdaten, Varianten und Inhalten)

## 3. Funktionale Anforderungen

### 3.1 Frontend (User-Interface)
* **Navigation:** Horizontale Navigationsleiste mit den Kategorien: Renovierung, Bau, verschiedene Produkte, Sicherheitsratgeber, Industriehardware, Projektratgeber und Guides. Zusätzlich drei große Themenflächen mit Bauen, Reparieren, Renovieren.
* **Such- und Filterfunktion:** Globale Suche und Möglichkeit, Produktlisten nach Kriterien zu filtern (z. B. Hersteller, Preis).
* **Produktdarstellung:** Grid-Ansicht für Produkte und Detailseiten mit konsistenten technischen Produktdaten. Auswahl von aktuellen Angeboten auf der Startseite.
* **Warenkorb:** Temporäre Speicherung von Artikeln zur Vorbereitung des Checkouts und sitzungsübergreifende Speicherung über User-Login.
* **User-Login:** Authentifizierungsbereich mit Unterscheidung zwischen den Rollen Heimwerker, Profikunden und Mitarbeiter. Spezifische Unterscheidung der Mehrwertsteuer.
* **Lokale Store-Infos:** Anzeige von Anfahrt, Öffnungszeiten im Footer-Bereich und Informationen über aktuellen Bestand bei den jeweiligen Produktseiten.

### 3.2 Backend (Express.js & Logik)
* **Routing:** EJS-Templates für Startseite, Kategorien, Produktdetails, Warenkorb und Guides.
* **Authentifizierung:** Einfaches Session- oder Token-basiertes Login-System zur Unterscheidung von Privat- und Geschäftskunden.
* **REST-API:** Bereitstellung von standardisierten Endpunkten im JSON-Format für externe Shopsysteme (Multichannel):
  * `GET /produkte` → alle Produkte
  * `GET /produkte/{id}` → einzelnes Produkt
  * `POST /produkte` → neues Produkt
  * `PUT`
  * `DELETE`

### 3.3 Custom CMS (Content Management System)
* **Verwaltung:** Möglichkeit der Rolle "Mitarbeiter", Produkte, Bestände und Ratgeberseiten anlegen, bearbeiten und löschen können.
* **Jedes Produkt besitzt:**
  * Name
  * Beschreibung
  * technische Daten
  * Varianten (z. B. Größen)
  * Lagerbestand (sowie der Zeitpunkt, wann die Artikel nächstes Mal wieder auf Lager sind)
  * Artikelnummer
* **Guides:** Möglichkeit, Step-by-Step Handwerksguides zu erstellen und diese mit passenden Produkten aus der Datenbank zu verlinken.

## 4. Datenmodell (Grobkonzept)
Das System erfordert mindestens drei Kern-Datenstrukturen:

### 1. User
* ID (fortlaufende NR)
* Vorname
* Nachname
* Adresse (Straße, Hausnr., PLZ, Stadt)
* E-Mail
* Passwort-Hash
* Rolle (Heimwerker/Geschäftskunde/Mitarbeiter)

### 2. Produkte
* Artikelnummer (EAN oder SKU)
* Name
* Beschreibung
* Kategorie
* technische Eigenschaften
* Varianten
* Bestand
* Preis_netto
* Steuersatz

### 3. Guides/Project-Pages
* ID
* Titel
* Inhalt
* Verknüpfte_Produkt_IDs

## 5. Nicht-funktionale Anforderungen
* **Design/CI:** Strikte Einhaltung der Unternehmensfarben:
  * Stahlblau `#335C67` (Header, Elemente wie Buttons und Navbar)
  * Kalkweiß `#F7F6F2` (Hintergrund)
  * Orange `#E09F3E` (Akzentfarbe für Highlights, Rahmen und Hover-Effekte)
* **Typografie:** Archivo (für Überschriften) und IBM Plex Sans (für Fließtexte).
* **Responsiveness:** Die Darstellung muss auf Desktop-Monitoren und Smartphones fehlerfrei funktionieren.
* **Sprache:** Die Benutzeroberfläche und Inhalte sind ausschließlich in deutscher Sprache zu verfassen.
* **Zeitrahmen:** Die Fertigstellung und Abnahme des Systems muss bis spätestens 08. Juli 2026 erfolgen.

## 6. Deployment
* Bereitstellung auf einem Webserver
* Zugriff über Browser
