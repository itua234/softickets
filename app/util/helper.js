const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const algorithm = 'aes-256-cbc'  //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const path = require("path");
const ejs  = require("ejs");
const axios = require("axios");
var admin = require("firebase-admin");
var serviceAccount = require("../../firebase-adminSDK.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
require('dotenv').config();

module.exports = {
    generateReference: (id) => 
    {
        let token = "";
        let codeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        codeAlphabet += 'abcdefghijklmnopqrstuvwxyz';
        codeAlphabet += '0123456789';
        let max = codeAlphabet.length - 1;
        for(var i = 0; i < 14; i++){
            token += codeAlphabet[Math.floor(Math.random() * (max - 0) + 0)]; 
        }; 
        return id+token.toLowerCase();
    },
    //Encrypting text
    encrypt: (text) =>
    {
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // return {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex')};
        return iv.toString('hex') + ":" + encrypted.toString('hex');
    },
    //Decrypting text
    decrypt: (text) =>
    {
        const textParts = text.split(":");
        let iv = Buffer.from(textParts[0], 'hex');
        let encryptedText = Buffer.from(textParts[1], 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    },
    generateOtp: () => 
    {
        // Generates Random number between given pair
        return Math.floor(Math.random() * (9999 - 1000) + 1000);
    },
    slugify: (string) =>
    {
        /*const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomString = "";
        for (let i=0; i<5; i++){
            randomString += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return string.replaceAll(' ', '-') + '-' + randomString;
        */
        let characters = Math.floor(Math.random() * (2999 - 2000) + 2000);
        return characters + "-" + string.replaceAll(' ', '-');
    },
    modifyTime: (dateStr) => {
        const date = new Date(dateStr);
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ]
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();
        return `${monthName}, ${year}`;
    },
    returnValidationError: (errors, res, message) => {

        Object.keys(errors).forEach((key, index) => {
            errors[key] = errors[key]["message"];
        });

        return res.status(422).json({
            message: message,
            error: errors
        });
    },
    getCurrentDateTime: () => {
        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = date.getHours() >= 12 ? "pm" : "am";

        const formattedDateTime = `${month}-${day}-${year} ${hours}:${minutes}${ampm}`;

        return formattedDateTime;
    },
    sendMail: async(options) => {
        // Create a transporter using SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            service: process.env.MAIL_MAILER,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            }
        });

        const {email, subject, template, data} = options;

        //get the template file
        const templatePath = path.join(__dirname, "..", "../views", "emails", template);
        //render the email template
        const html = await ejs.renderFile(templatePath, data);

        // Email content
        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: email,
            subject,
            html
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        
    },
    sendSms: async() => {

    },
    sendPushNotification: async (payload) => {
        const messaging = admin.messaging();
        try {
          await messaging.send(payload);
          console.log('Push notification sent successfully:', payload.token);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
    },
    useTermii: async (to, message) => {
        const params = JSON.stringify({
            "to": to,
            "from": "N-Alert",
            "sms": message,
            "type": "plain",
            "api_key": process.env.TERMII_KEY,
            "channel": "dnd"
        });
        const config = {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            }
        };
        axios.post(
            process.env.TERMII_URL, 
            params, 
            config
        ).then(function(response){
            console.log(response);
        }).catch(function(error){
            console.log(error);
        });
    }

}