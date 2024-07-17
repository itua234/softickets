const express = require('express');
const router = express.Router();
const auth = require('../app/http/controllers/auth');
const { authGuard, appGuard } = require("../app/http/middleware/auth");
const validator = require('../app/validators/auth');

router.post('/signup', [validator.register], auth.register);
//router.post('/confirm-email', [appGuard, validator.confirm_email], auth.confirm_email);
//router.get('/verify-email/:email/:code', [appGuard, validator.verify_email], auth.verify_email);
router.get('/email/verify/:email/:code/', [validator.verify_email], auth.verify_email);
router.post('/signin', [validator.login], auth.login);
//router.post('/google/callback', [validator.google_login], auth.google_signin);
router.get('/signout', [authGuard], auth.logout);
//router.post('/reset-password', [appGuard, validator.send_code], auth.send_code);
router.post('/password-reset', [validator.resetPasswordSchema], auth.resetPassword);
router.post('/change-password', [authGuard, validator.changePasswordSchema], auth.changePassword);

router.get('/email/:email/:purpose/send-code', [validator.send_code], auth.send_code);

module.exports = router;