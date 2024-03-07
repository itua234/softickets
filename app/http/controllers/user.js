const bcrypt = require('bcrypt');
const { sequelize, models: { User, Notification } } = require('../../models');
const { generateOtp, sendMail } = require('../../util/helper');
require('dotenv').config();

class BookingCreated {
    constructor(data) {
        this.data = data;
        this.toArray();
    }

    via(){
        return ['database', 'mail'];
    }

    async send(user){
        let types = this.via();
        for(let type of types){
            switch(type){
                case "database":
                    console.log(type);
                    await Notification.create({ 
                        type: "user",
                        notifiable_id: user.id,
                        notifiable_type: "user",
                        data: this.data
                    });
                break;
                case "mail":
                    this.toMail({
                        email: user.email, 
                        data: this.data
                    })
                break;
            }
        }
    }

    async toMail(notifiable)
    {
        return await sendMail({
            email: notifiable.email,
            subject: "Test Mail",
            template: "test-mail.ejs",
            data: notifiable.data
        });
    }

    toArray(notifiable)
    {
        this.data = {data: this.data};
    }
}

exports.get_user = async(req, res) => {
    let user = await User.findOne({
        where: {
            id: req.user.id,
        }
    });
    return res.json(await user.unReadNotifications());
    let notificationData = "this is my notification";
    const bookingNotification = new BookingCreated(notificationData);
    return res.json( await user.notify(bookingNotification));

    return res.status(200).json({
        message: 'User::',
        results: bookingNotification,
        error: false
    });
}

exports.set_pin = async(req, res) => {
    const { pin } = req.body;
    let user = await User.findOne({
        where: {
            id: req.user.id,
        }
    });
    if(!user){
        return res.status(400).json({
            message: "Oops, can't add pin at this time",
            error: true
        });
    }
};

exports.update_profile = async(req, res) => {
    return res.status(200).json({
        message: 'User:',
        results: req.user,
        error: false
    });
}
