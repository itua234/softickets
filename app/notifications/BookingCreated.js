class BookingCreated {
    constructor(data) {
        this.data = data;
    }

    via(notifiable){
        return ['database', 'mail'];
    }

    async toMail(notifiable)
    {
        return await sendMail({
            email: user.email,
            subject: "Email Verification",
            template: "activation-mail.ejs",
            data: this.data
        });
    }

    toArray(notifiable)
    {
        return {
            "data": this.data
        };
    }
}
  
module.exports = BookingCreated;

//const BookingCreated = require('./app/Notifications/BookingCreated');

//const bookingNotification = new BookingCreated();
// Get the class name (constructor name in JavaScript)
//const className = bookingNotification.constructor.name;


/*const bookingNotification = new BookingCreated(notificationData);

// Notify the user
await user.notify(bookingNotification);*/