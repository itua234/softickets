const nodemailer = require('nodemailer');
require('dotenv').config();

export const mail = (from, to, subject, text) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            res.json('error');
        }else{
            res.json('Email sent: '+ info.response);
        }
    });
}