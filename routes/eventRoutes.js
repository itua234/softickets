const express = require('express');
const router = express.Router();
const event = require('../app/http/controllers/event');
const { authGuard, appGuard } = require("../app/http/middleware/auth");
const validator = require('../app/validators/user');
const multer = require('multer');
const path = require('path');
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/images/uploads')
        },
        filename: (req, file, cb) => {
            console.log(file);
            //cb(null, Date.now() + '-' + file.originalname)
            cb(null,  `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if(file.mimetype === "image/jpeg" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/svg"
        ){
            cb(null, true);
        }else{
            cb(null, false);
        }
    },
    limits: {
        fileSize: 2 * 1024  * 1024, //2MB
        files: 2
    }
});
const handleMulterError = (err, req, res, next) => {
    if(err instanceof multer.MulterError && err.code === "LIMIT_FILE_COUNT"){
        console.log("Too many files. Max allowed: 5 files");
        return res.status(422).json({
            message: "failed to create new event",
            error: {
                images: "Too many files. Max allowed: 3 files"
            }
        });
    }else if (err) {
        return res.status(500).json({
            message: "Failed to upload files",
            error: err.message
        });
    }
    next();
}

module.exports = router;