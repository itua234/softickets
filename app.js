const express = require('express');
const app = express();
require('dotenv').config();

const AppError = require('./app/util/appError');
const globalErrorHandler = require('./app/util/errorHandler');

const api = require('./routes/api');
const web = require('./routes/web');

const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csurf = require("tiny-csrf");
const db = require('./app/models');
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cors({
    origin: "*"
}));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(session({
    key: "user_sid",
    secret: process.env.APP_TOKEN,
    resave: false,
    saveUninitialized: true,
    /*cookie: {
        //expires: 600000,
        secure: false,
        httpOnly: true,
        maxAge: null
    }*/
}));
app.use(cookieParser());
//app.use(csurf("123456789iamasecret987654321look"));

const { PORT, APP_ENV } = process.env; 

if(APP_ENV === "production"){
    db.sequelize.sync().then((req) => {
        app.listen(PORT, () => {
            console.log('Listening on Port: ' + PORT);
        });
        useRoutes();
    });
}else{
    db.sequelize.sync({ alter: false }).then((req) => {
        app.listen(PORT, () => {
            console.log('Listening on Port: ' + PORT);
        });
        useRoutes();
    });
}

function useRoutes() {
    // Define a middleware to add common variables to req & res locals
    app.use((req, res, next) => {
        const baseUrl = req.protocol + '://' + req.get('host');
        res.locals.baseUrl = baseUrl;
        req.requestTime = new Date().toISOString();
        res.locals.title = "9ja Tickets";
        //const csrfToken = req.csrfToken();
        //res.locals.csrfToken = csrfToken;
        next();
    });

    app.get('/sitemap.xml', function(req, res){
        res.type('application/xml');
        res.sendFile(path.join(__dirname, "public", "sitemap.xml"));
    });

    app.use('', web);
    app.use('/api/v1', api);

    //Handling unhandles routes for all http methods
    app.all("*", (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    app.use(globalErrorHandler);
}