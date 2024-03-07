const express = require('express');
const router = express.Router();
const auth = require('../app/http/controllers/auth');
const user = require('../app/http/controllers/user');
const wallet = require('../app/http/controllers/wallet');
const event = require('../app/http/controllers/event');
const { authGuard, isSofcrypt } = require("../app/http/middleware/auth");
const authValidator = require('../app/validators/auth');
const userValidator = require('../app/validators/user');
const eventValidator = require('../app/validators/event');
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
        files: 3
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
    }
}

router.get('/', function (req, res) {
    res.json({
        'app': 'Softickets API',
        'version': '1.0.0'
    })
});

router.get('/user/', [authGuard], user.get_user);
router.post('/user/', [authGuard, userValidator.updateProfileSchema], user.update_profile);

router.get('/account/verify/:account/:code', [], wallet.verify_account);
router.get('/currency', [authGuard], wallet.getCurrencies);

router.route('/event')
.get(event.getAllEvents)
.post([authGuard, upload.single('image'), handleMulterError], event.createEvent);

router.route('/event/:slug')
.get(event.getEvent)
//.post([authGuard, upload.array('images', 3), handleMulterError, updateProductSchema], event.update)
//.delete(event.delete);

router.route('/event/:eventId/ticket')
.post([authGuard, upload.single('image'), handleMulterError, eventValidator.createTicketSchema], event.createTicket)

router.route('/event/:eventId/ticket/:ticketId')
.put([authGuard, upload.single('image'), handleMulterError, eventValidator.editTicketSchema], event.editTicket)
.delete(event.deleteTicket);

router.post('/auth/signup', [authValidator.register], auth.register);
router.get('/auth/email/verify/:email/:code/', [authValidator.verify_email], auth.verify_email);
router.post('/auth/signin', [authValidator.login], auth.login);
router.get('/auth/signout', [authGuard], auth.logout);
router.post('/auth/password/reset', [authValidator.resetPasswordSchema], auth.resetPassword);
router.post('/auth/change-password', [authGuard, authValidator.changePasswordSchema], auth.changePassword);
router.get('/email/:email/:purpose/send-code', [authValidator.send_code], auth.send_code);

router.get("/test", function(req, res){
    from = Math.floor(new Date("2023-08-10").getTime() / 1000);
    return res.json(from);
});

module.exports = router;