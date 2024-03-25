const express = require('express');
const router = express.Router();
const auth = require('../app/http/controllers/auth');
const event = require('../app/http/controllers/event');
const { authGuard, isSofcrypt } = require("../app/http/middleware/auth");
const authValidator = require('../app/validators/auth');

router.get("/", function(req, res){
    res.render('index');
});

router.route('/login')
.get([], function(req, res){
    //const csrfToken = req.csrfToken();
    const apiKey = process.env.CARTRILLA_TOKEN;
    res.render('auth/login', {apiKey});
})//.post([loginSchema], auth.login);

router.route('/register')
.get([], function(req, res){
    res.render('auth/signup');
})//.post([registerSchema], auth.register);

router.route('/:slug').get(event.showEvent)

router.route('/:slug/book').get(event.ticketCheckout)

router.route('/transaction/verify').get(event.confirmPayment)

module.exports = router;