const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const adminMain = require('../app/http/controllers/admin/main');
const wallet = require('../app/http/controllers/wallet');
const event = require('../app/http/controllers/event');
const { authGuard, isSofcrypt } = require("../app/http/middleware/auth");
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

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

router.route('/events')
.get(event.getAllEvents)
.post([
    authGuard, upload.single('image'), handleMulterError, eventValidator.createEventSchema
], event.createEvent);

router.route('/events/:slug')
.get(event.getEvent)
//.post([authGuard, upload.array('images', 3), handleMulterError, updateProductSchema], event.update)
//.delete(event.delete);

router.route('/events/:eventId/ticket').post([
    authGuard, eventValidator.createTicketSchema
], event.createTicket)

router.route('/events/:eventId/ticket/:ticketId')
.put([
    authGuard, upload.single('image'), handleMulterError, eventValidator.editTicketSchema
], event.editTicket)
.delete(event.deleteTicket);

router.post('/events/:eventId/book', event.bookTicket);

router.get('/categories/:categoryId/events', event.getEventsByCategory);

router.get('/transaction/verify', [], event.confirmPayment);
router.post('/transaction/webhook', [], event.confirmPayment);
router.get('/account/verify/:account/:code', [], wallet.verify_account);
router.get('/currency', [authGuard], wallet.getCurrencies);
router.get('/banks', [authGuard], wallet.getBanks);

router.get('/statistics', [], adminMain.getStatistics);

module.exports = router;