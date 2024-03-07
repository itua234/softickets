const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {createAccessToken} = require("../middleware/auth");
const { sequelize, models: { User, Otp } } = require('../../models');
const { generateOtp, sendMail } = require('../../util/helper');
require('dotenv').config();

exports.register = async(req, res) => {
    const { email, name, password } = req.body;
    
    try{
        await sequelize.transaction(async function(transaction) {
            const user = await User.create({
                email, 
                name, 
                password,
                referral_code: generateOtp()
            }, {transaction});
        
            let code = generateOtp();
            await Otp.create({ 
                otpable_id: user.id,
                otpable_type: "user",
                code,
                purpose: "email_verification"
            }, {transaction});

            await sendMail({
                email: user.email,
                subject: "Email Verification",
                template: "activation-mail.ejs",
                data: {user, code}
            });
            
            return res.status(201).json({
                message: 'Thanks for signing up! Please check your email to complete your registration.',
                results: user.email,
                error: false
            });
        });
    }catch(error){
        return res.status(500).json({
            message: "could not create account, please try again later",
            error: true
        });
    }
};

exports.login = async(req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({
        where: {email: email},
        raw: true
    });
    if(!user || !(await bcrypt.compare(password, user.password))){
        return res.status(400).json({
            message: "Invalid email or password",
            error: true
        });
    }else if(!user.email_verified_at){
        return res.status(401).json({
            message: "Email address not verified, please verify your email before you can login",
            error: true
        });
    }else{
        //create token
        const token = createAccessToken(user);
        res.status(200).json({
            message: 'Login successful',
            results: token,
            error: false
        });
    }
};

exports.logout = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const user = jwt.decode(
        token, 
        process.env.TOKEN_SECRET
    );

    var newToken = jwt.sign(
        {user: user},
        process.env.TOKEN_SECRET,
        {
            expiresIn: '1s',
        }
    );
   
    return res.status(200).json({
        message: 'You have been logged out',
        results: newToken,
        error: false
    });
}

exports.verify_email = async(req, res) => {
    const { email, code } = req.params;
    const user = await User.findOne({
        where: {
            email: email
        }
    });
    let check = await Otp.findOne({
        where: {
            otpable_id: user.id,
            otpable_type: "user",
            code: code,
            purpose: 'email_verification',
            valid: true
        }
    });

    if(Object.is(check, null)){
        return res.status(422).json({
            message: "could not verify email, please try again",
            error: true
        });
    }else{
        user.email_verified_at = new Date();
        await user.save();

        await check.destroy();
        //create token
        const token = createAccessToken(user);

        return res.status(201).json({
            message: 'Your email address has been successfully verified. Click continue to complete your sign-up!',
            results: token,
            error: false
        });
    }
};

exports.send_code = async(req, res) => {
    const { email, purpose } = req.params;
    let user = await User.findOne({
        where: { email: email },
        raw:true
    });
    
    await Otp.create({ 
        otpable_id: user.id,
        otpable_type: "user",
        code: generateOtp(),
        purpose: purpose
    });

    return res.status(200).json({
        message: 'Please check your email to verify your email.',
        results: email,
        error: false
    });
};

exports.verify_code = async(req, res) => {
    const { email, token } = req.params;
    let user = await User.findOne({
        where: {
            email: email,
        },
        raw:true
    });

    let check = await Otp.findOne({
        where: {
            otpable_id: user.id,
            otpable_type: "user",
            token: token,
            purpose: 'password_reset',
            valid: true
        },
        raw: true
    });

    if(Object.is(check, null)){
        return res.status(400).json({
            message: 'Invalid data.',
            results: null,
            error: false
        });
    }else{
        return res.status(200).json({
            message: 'Your token verification was successful.',
            results: check,
            error: false
        });
    }
};

exports.resetPassword = async(req, res) => {
    const { email, token, password } = req.body;
    let user = await User.findOne({
        where: {email: email}
    });
    user.password = password;
    await user.save();

    await Otp.destroy({
        where: {
            otpable_id: user.id,
            otpable_type: "user",
            purpose: "password_reset",
            token: token,
            valid: true
        },
        raw: true
    });

    return res.status(200).json({
        message: 'Your password has been successfully changed',
        results: null,
        error: false
    });
};

exports.changePassword = async(req, res) => {
    const { current_password, password } = req.body;
    let user = await User.findOne({
        where: {id: req.user.id}
    });

    if (!await bcrypt.compare(current_password, user.password)) {
        var message = 'Check your current password.';
    }else if(await bcrypt.compare(password, user.password)){
        var message = 'Please enter a password which is not similar to your current password.';
    }else {
        user.password = password;
        await user.save();
    
        return res.status(200).json({
            message: 'Your password has been successfully changed',
            results: null,
            error: false
        });
    }

    return res.status(400).json({
        message: message,
        error: true
    });
};