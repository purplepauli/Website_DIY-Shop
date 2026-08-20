const express = require("express"); 
const router = express.Router(); 

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const models = require("../services/models.js");

//middleware
const redirectIfAuthenticated = require("../middleware/redirectIfAuthenticated.js");

function sendLoginError(res, msg){
    return res.render('login.ejs', {error: msg});
}


router.post("/login", async (req, res) => {
    const invalidCredentialsErrorMessage = "Ungültige Zugangsdaten";
    const captchaNotSolvedErrorMessage = "Bitte bestätige, dass Du ein Mensch bist";
 
    const pl = req.body;

    if(!(pl.isHuman === "true")) return sendLoginError(res, captchaNotSolvedErrorMessage);

    if (!pl.password || !pl.email) return sendLoginError(res, invalidCredentialsErrorMessage);

    const modelsReq = models.get("users", "email", pl.email);
    if(!modelsReq.success || !modelsReq.data) return sendLoginError(res, invalidCredentialsErrorMessage);

    const user = modelsReq.data;

    const passwordWithPepper = pl.password + process.env.PASSWORD_PEPPER;
    const passwordMatches = await bcrypt.compare(passwordWithPepper, user.password);

    if (!passwordMatches) return sendLoginError(res, invalidCredentialsErrorMessage);


    // this must not include sensitive information like passwords!
    tokenUser = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        isAdmin: user.isAdmin
    };

    const token = jwt.sign(
        tokenUser,
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,       // true in production (HTTPS!)
        sameSite: "strict",
        maxAge: 3600000
    });

    if(user.isAdmin) return res.redirect("/mitarbeiter/dashboard");

    return res.redirect("/");
});

router.get('/login', redirectIfAuthenticated, (req, res, next) => {
    res.render('login.ejs');
});


router.get('/register', redirectIfAuthenticated, (req, res, next) => {
    res.render('register.ejs');
});

function rejectParameters(req, res, msg){
    console.log("A user faild to register because of invalid parameters. Here's the body", req.body);
    console.log(`Error message: ${msg}`);
    return res.render("register.ejs", { error: "Ein Fehler ist aufgetreten. Bitte melde ihn!" });
}


router.post('/register', async (req, res, next) => {
    const models = require("../services/models.js");
    const User = require("../schemas/users.js");

    const pl = req.body;

    if(!(pl.isHuman === "true")) return rejectParameters(req, res, "Failed captcha");
    
    if(!(typeof pl.surname === "string")) return rejectParameters(req, res, "Invalid surname type");
    if(!(typeof pl.name === "string")) return rejectParameters(req, res, "Invalid name type");
    if(!(typeof pl.email === "string")) return rejectParameters(req, res, "Invalid email type");
    if(!(typeof pl.password === "string")) return rejectParameters(req, res, "Invalid password type");
    if(!(typeof pl.confirmPassword === "string")) return rejectParameters(req, res, "Invalid confirm password type");

    if(pl.password.length < 8) return rejectParameters(req, res, "Password to short");
    if(pl.password.length > 200) return rejectParameters(req, res, "Password to long");
    
    const isValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(pl.password);
    if(!isValid) return rejectParameters(req, res, "Password missing special characters");
    if(!(pl.password === pl.confirmPassword)) return rejectParameters(re, res, "Password and confirm password do not match");


    // check if email was already used for another account
    const modelsReqCheck = models.get("users", "email", pl.email);
    if(!modelsReqCheck.success) return rejectParameters(req, res, modelsReqCheck.msg || "UNKNOWN ERROR");
    if(modelsReqCheck.exists) return res.render("register.ejs", { error: "Diese Email wird bereits für einen anderes Konto verwendet." });


    const isAdmin = (pl.isAdmin === "true") ? true : false;
    const passwordWithPepper = pl.password + process.env.PASSWORD_PEPPER;
    const hashedPassword = await bcrypt.hash(passwordWithPepper, 12);
    const modelsReq = models.add("users", new User(pl.name, pl.surname, pl.email, hashedPassword, isAdmin));

    if(!modelsReq.success) {
        console.log("A user faild to register, please fix this Error: ", modelsReq.err || "UNKNOWN ERROR");
        return res.render("register.ejs", { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut!" });
    }
    
    return res.render("login.ejs", { success: "Account erstellt. Bitte melde Dich an." });
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});


module.exports = router;