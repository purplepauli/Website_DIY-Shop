// setup
const express = require("express"); 
const router = express.Router(); 

// middleware
const auth = require('../middleware/auth');

// imports
const models = require('../services/models');
const Transaction = require('../schemas/transactions');


router.get('/', auth, (req, res, next) => {
    res.render("payment.ejs");
});

router.post('/', auth, async (req, res, next) => {

    const pl = req.body;

    if(!pl.cart || pl.cart.length < 1) return res.status(400).json({ success: false, msg: "Invalid" });

    if(!pl.paymentMethod) return res.status(400).json({ success: false, msg: "Invalid" });

    const modelsReq = models.add("transactions", new Transaction(crypto.randomUUID(), Date.now(), req.user.email, req.user.name, req.user.surname, pl.cart, pl.paymentMethod));

    if(!modelsReq.success) return res.status(400).json({ success: false, msg: modelsReq.msg });

    return res.status(200).json({ success: true, msg: "Success" });
})


module.exports = router;