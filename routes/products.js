const express = require("express"); 
const router = express.Router(); 
const findProducts = require("../services/productService.js")

router.get('/', async (req, res, next) => {
    const selectedCategory = req.query.category || "alle";
    const selectedSubcategory = req.query.subcategory || "alle";
    const selectedSort = req.query.sort || "name_asc";
    const nurAngebote = req.query.nurAngebote === "true";

    // Basisliste abhängig vom Angebots-Filter laden. Die Route entscheidet
    // hier, welche Ausgangsliste an die (jetzt generische) Filter-/Sortier-
    // Funktion übergeben wird - nicht die Funktion selbst.
    const basisListe = nurAngebote
        ? await findProducts.getAngebotsProdukte()
        : await findProducts.getAllProducts();

    const products = findProducts.filterAndSortProducts(basisListe, {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        sort: selectedSort
    });
    const categories = await findProducts.getDistinctCategories();

    res.render("products", {
        title: selectedCategory === "alle" ? "Unsere Produkte - DIY Store Würzburg" : `${selectedCategory} - DIY Store Würzburg`,
        products,
        categories,
        selectedCategory,
        selectedSubcategory,
        selectedSort,
        nurAngebote,
        extraStyles: ['/stylesheets/product-section.css'], //übergibt die CSS-Datei für das product-grid an die view
    });

});

router.get('/:id', async (req, res, next) => {
    const product = await findProducts.getProductById(req.params.id);
    if (!product) {
        return res.status(404).render('error', { 
            title: 'Produkt nicht gefunden',
            message: 'Das gewünschte Produkt konnte nicht gefunden werden.',
            error: {}
        });
    }
    res.render("product-detail", {
        title: product.name + ' - DIY Store',
        product: product,
        extraStyles: ['/stylesheets/product-details.css']
    });
});

router.post('/', function(req, res, next) {
    res.send("Erstelle ein Produkt");
});

module.exports = router;