const express = require('express');
const router = express.Router();
const auth = require('../app/http/controllers/auth');
const event = require('../app/http/controllers/event');
const { isAdmin, isGuest, checkSession } = require("../app/http/middleware/auth");
const authValidator = require('../app/validators/auth');

router.get("/", function(req, res){
    res.render('index');
});

router.get("/success", function(req, res){
    res.render('success');
});

router.get("/dashboard", [checkSession, function(req, res){
    res.render('user/index', { user: req.session.user });
}]);
router.get("/dashboard/account", [checkSession, function(req, res){
    res.render('user/account', { user: req.session.user });
}]);
router.get("/dashboard/events", [checkSession, event.showEvents]);
router.get("/dashboard/events/create", [checkSession, event.showCreateEventForm]);

router.get("/dashboard/:uuid/ticket/manage", [checkSession, event.showEventTickets]);

router.route('/login')
.get([isGuest], function(req, res){
    //const csrfToken = req.csrfToken();
    const apiKey = process.env.CARTRILLA_TOKEN;
    res.render('auth/login', {apiKey});
})//.post([loginSchema], auth.login);

router.route('/register')
.get([isGuest], function(req, res){
    res.render('auth/signup');
})//.post([registerSchema], auth.register);

router.route('/:slug').get(event.showEvent)

router.route('/:slug/book').get(event.ticketCheckout)

router.route('/transaction/verify').get(event.confirmPayment)

module.exports = router;