// setup
const express = require("express"); 
const router = express.Router(); 

// middleware
const auth = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminOnly');

// imports
const models = require('../../services/models');
const SafetyGuide = require('../../schemas/safety');


// routes
router.get(['/', '/:page'], auth, adminOnly, (req, res) => {

    if(!req.user) return res.redirect('/');
    if(!req.user.isAdmin) return res.redirect('/');
    
    const page = req.params.page;
    let partial = "overview";
    let data = {};

    switch (page) {
        case "sicherheitsratgeber":
            partial = "safety";

            try {
                const modelsReq = models.getAll("safety"); 

                if(modelsReq.success) data = modelsReq.data;
            } catch (err) {
                data = [];
            }
            break;
        case "produkte":
            partial = "products";

            try {
                const modelsReq = models.getAll("products"); 

                if(modelsReq.success) data = modelsReq.data;
                else data = [];
            } catch (err) {
                data = [];
            }
            break;
        case "accounts":
            partial = "accounts";
            try {
                const modelsReq = models.getAll("users"); 

                if(modelsReq.success) data = modelsReq.data;
                else data = [];
            } catch (err) {
                data = [];
            }
            break;
        case "bestellungen":
            partial = "orders";
            try {
                const modelsReq = models.getAll("transactions"); 

                if(modelsReq.success) data = modelsReq.data;
                else data = [];
            } catch (err) {
                data = [];
            }
            break;
        case "guides":
            partial = "guides";
            break;
        default:
            partial = "overview";

            try {
                const modelsReq = models.getAll("safety"); 
                const modelsReq2 = models.getAll("transactions");
                const modelsReq3 = models.getAll("users");

                if(modelsReq.success) data.guideTotal = modelsReq.data.length;
                if(modelsReq2.success) data.orderTotal = modelsReq2.data.length;
                if(modelsReq3.success) data.accountTotal = modelsReq3.data.length;

            } catch (err) {
                data = [];
            }

            break;
    }

    let overlay = false
    if(req.query.o && req.query.o === "true") overlay = true;

    return res.render('dashboard.ejs', { user: req.user, page: partial, data, overlay});
})


module.exports = router;