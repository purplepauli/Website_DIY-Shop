var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
var legalPages = require('../data/legals.json');
var productService = require('../services/productService.js');

/* GET home page. */
router.get('/', async function(req, res, next) {

  /* Zufällige Auswahl von 4 Produkten, die im Angebot sind */
  const products = productService.pickRandomProducts(await productService.getAngebotsProdukte(), 4);

  const isLoggedIn = Boolean(req.cookies?.token);

  res.render('index', {
    title: 'DIY Store - Würzburg',
    products: products,
    extraStyles: ['/stylesheets/product-section.css'], 
    isLoggedIn
  });
  console.log(isLoggedIn)
});

/* GET product detail page (ERSETZTZT DURCH PRODUCTS.JS ROUTER) */
/*
router.get('/produkt/:artikelnummer', function(req, res, next) {
  // 1. Den korrekten Pfad zur produkte.json bauen
  const dbPath = path.join(__dirname, '../data/products.json');
  
  // 2. Die JSON-Datei einlesen und in ein JavaScript-Array umwandeln
  let produkteDaten = [];
  try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    produkteDaten = JSON.parse(rawData);
  } catch (error) {
    console.error("Fehler beim Laden der Produktdaten:", error);
    return res.status(500).render('error', { 
      title: 'Fehler',
      message: 'Produktdaten konnten nicht geladen werden',
      error: error
    });
  };

  // 3. Das Produkt mit der angegebenen Artikelnummer finden
  const product = produkteDaten.find(p => p.artikelnummer === req.params.artikelnummer);
  
  // 4. Wenn das Produkt nicht gefunden wurde, 404 Fehler anzeigen
  if (!product) {
    return res.status(404).render('error', { 
      title: 'Produkt nicht gefunden',
      message: 'Das gewünschte Produkt konnte nicht gefunden werden.',
      error: {}
    });
  }

  // 5. Das Produkt-Objekt rendern mit der product-detail View
  res.render('product-detail', {
    title: product.name + ' - DIY Store',
    product: product,
    extraStyles: ['/stylesheets/product-details.css']
  });
});
*/

router.get('/:page(impressum|datenschutz|agb)', function(req, res, next) {
  const page = legalPages[req.params.page];

  res.render('legal', {
    title: page.title,
    page: page
  });
});

/* GET cart page. */
router.get('/warenkorb', function(req, res, next) {
  res.render('cart', { 
    title: 'Dein Warenkorb - DIY Store',
    extraStyles: ['/stylesheets/cart.css'], //übergibt die CSS-Datei für den Warenkorb an die view
    extraScripts: ['/javascripts/cart.js']}); // Übergibt die JS-Datei für den Warenkorb an die view
});

module.exports = router;
