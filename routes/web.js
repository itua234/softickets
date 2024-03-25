const express = require('express');
const router = express.Router();
const auth = require('../app/http/controllers/auth');
const event = require('../app/http/controllers/event');
const { authGuard, isSofcrypt } = require("../app/http/middleware/auth");
const authValidator = require('../app/validators/auth');

router.get("/", function(req, res){
    res.render('index');
});

router.route('/:slug').get(event.showEvent)

router.route('/:slug/book').get(event.ticketCheckout)

router.route('/transaction/verify').get(event.confirmPayment)

module.exports = router;