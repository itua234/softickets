const express = require('express');
const router = express.Router();
const auth = require('../app/http/controllers/auth');
const { authGuard, isSofcrypt } = require("../app/http/middleware/auth");
const authValidator = require('../app/validators/auth');

router.get("/", function(req, res){
    res.render('index');
});

module.exports = router;