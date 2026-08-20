// router setup
const express = require("express"); 
const router = express.Router(); 

// middleware
const auth = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminOnly');

// imports
const models = require('../../services/models');
const SafetyGuide = require('../../schemas/safety');
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//setup
const uploadDir = path.join(__dirname, "../../public/images/guides");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = crypto.randomUUID() + ext;

        cb(null, filename);
    }
});


const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        if(!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only images are allowed"));
        }

        cb(null, true);
    },

    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});



// routes
router.post(
    "/create/safety",
    auth,
    adminOnly,
    upload.single("image"),
    (req, res) => {

    if(
        !req.body.title ||
        !req.body.category ||
        !req.body.tag ||
        !req.body.teaser ||
        !req.body.intro ||
        !req.body.difficulty ||
        !req.body.time
    ){
        return res.status(400).json({
            success:false,
            msg:"Missing parameters"
        });
    }


    if(!req.file){
        return res.status(400).json({
            success:false,
            msg:"Missing image"
        });
    }


    try {

        const imagePath = `/images/guides/${req.file.filename}`;


        const newSafetyGuide = new SafetyGuide(
            crypto.randomUUID(),
            req.body.title,
            req.body.category,
            req.body.tag,
            imagePath,
            req.body.teaser,
            req.body.intro,
            Number(req.body.difficulty),
            req.body.time
        );


        const modelsReq = models.add(
            "safety",
            newSafetyGuide
        );

        if(!modelsReq.success){
            return res.status(400).json({
                success:false,
                msg:modelsReq.msg
            });
        }


        res.status(200).json({
            success:true,
            msg:"Success",
            data:newSafetyGuide
        });


    } catch(err){

        // Falls Datenbank fehlschlägt Bild wieder löschen
        if(req.file){
            fs.unlink(
                path.join(uploadDir, req.file.filename),
                ()=>{}
            );
        }


        res.status(500).json({
            success:false,
            msg:err.message
        });
    }
});


router.get("/getall/safety", auth, adminOnly, (req, res) => {
    const modelsReq = models.getAll("safety");

    if(!modelsReq.success) return res.status(400).json({ success: false, msg: modelsReq.msg });

    res.status(200).json({ success: true, data: modelsReq.data });
});


router.delete("/deleteone/safety/:id", auth, adminOnly, (req, res) => {

    if(!req.params.id) return res.status(400).json({ success: false, msg: "Missing id" });

    const modelsReq = models.deleteOne("safety", "id", req.params.id);

    if(!modelsReq.success) return res.status(400).json({ success: false, msg: modelsReq.msg });

    res.status(200).json({ success: true, msg: "Success" });
});

router.delete("/deleteone/user/:email", auth, adminOnly, (req, res) => {

    if(!req.params.email) return res.status(400).json({ success: false, msg: "Missing email" });

    const modelsReq = models.deleteOne("users", "email", req.params.email);


    if(!modelsReq.success) return res.status(400).json({ success: false, msg: modelsReq.msg });

    res.status(200).json({ success: true, msg: "Success" });
});

router.delete("/deleteone/transaction/:id", auth, adminOnly, (req, res) => {

    if(!req.params.id) return res.status(400).json({ success: false, msg: "Missing id" });


    const modelsReq = models.deleteOne("transactions", "id", req.params.id);


    if(!modelsReq.success) return res.status(400).json({ success: false, msg: modelsReq.msg });

    res.status(200).json({ success: true, msg: "Success" });
});

router.patch("/updateone/transaction/:id", auth, adminOnly, (req, res) => {

    if(!req.params.id) {
        return res.status(400).json({ 
            success: false, 
            msg: "Missing id" 
        });
    }

    if(!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ 
            success: false, 
            msg: "Missing update parameters" 
        });
    }

    try {
        const modelsReq = models.updateOne(
            "transactions",
            "id",
            req.params.id,
            req.body
        );

        if(!modelsReq.success) {
            return res.status(400).json({ 
                success: false, 
                msg: modelsReq.msg 
            });
        }

        res.status(200).json({ 
            success: true, 
            msg: "Success",
            data: modelsReq.data
        });

    } catch(err) {
        res.status(500).json({ 
            success: false, 
            msg: err 
        });
    }
});


module.exports = router;