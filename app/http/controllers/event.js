const { sequelize, models: { 
    Notification, Transaction,
    Currency, Event, 
    Ticket, Attendee, Order
} } = require('../../models');
const { slugify, generateReference, sendMail, useTermii } = require('../../util/helper');
const { pay, getPaymentData } = require('../../util/payment');
const { upload } = require('../../services/cloudinary');
const { escape } = require('querystring');
require('dotenv').config();

exports.createEvent = async(req, res) => {
    const { title, categoryId, description, venue, date } = req.body;
    const {url} = await upload(req.file.path)

    let event = await Event.create({
        creator_id: req.user.id,
        category_id: categoryId,
        title,
        description, 
        venue,
        image: url,
        slug: slugify(title),
        date
    });

    return res.status(200).json({
        message: 'your event has been created::',
        results: event,
        error: false
    });
}

exports.createTicket = async(req, res) => {
    const { eventId } = req.params;
    const { name, price, quantity, purchase_limit, currency_id, is_free } = req.body;
    const {url} = await upload(req.file.path)

    //const createTicketPromises = tickets.map(async(ticket) => {
        await Ticket.create({
            event_id: eventId,
            name: name,
            price: price,
            quantity: quantity,
            purchase_limit: parseInt(purchase_limit),
            currency_id: currency_id,
            is_free: parseInt(is_free),
            image: url
        });
    //});

    // Wait for all promises to resolve
    //await Promise.all(createTicketPromises);

    // Fetch the list after all tickets have been created
    let lists = await Ticket.findAll({
        where: {event_id: eventId}
    });

    return res.status(200).json({
        message: 'Your event has been created:',
        results: lists,
        error: false
    });
}

exports.editTicket = async(req, res) => {
    const { ticketId, eventId } = req.params;
    const params = req.body;
    let ticket = await Ticket.findOne({
        where: {id: ticketId}
    });
    if(!ticket){
        return res.status(404).json({
            message: "You do not have the permission to update this content",
            error: true
        });
    }

    if(req.file){
        const {url} = await upload(req.file.path)
        ticket.image = url;
    }
    
    const saveData = async () => {
        Object.keys(params).forEach(async(param) => {
            if(param != "image"){
                ticket[param] = params[param]
            }
        });
        await ticket.save();
    }
    saveData()
    .then(async() => {
        let lists = await Ticket.findAll({
            where: {event_id: eventId}
        });
    
        return res.status(200).json({
            message: 'Your ticket has been updated!',
            results: lists,
            error: false
        });
    });
}

exports.deleteTicket = async(req, res) => {
    const { ticketId, eventId } = req.params;
    let ticket = await Ticket.findOne({
        where: {id: ticketId}
    });
    if(!ticket){
        return res.status(404).json({
            message: "You do not have the permission to update this content",
            error: true
        });
    }
    
    const deleteTicket = async () => {
        await Ticket.destroy({
            where: {id: ticket.id}
        });
    }
    deleteTicket()
    .then(async() => {
        let lists = await Ticket.findAll({
            where: {event_id: eventId}
        });
    
        return res.status(200).json({
            message: 'ticket has been deleted!',
            results: lists,
            error: false
        });
    });
}

exports.getAllEvents = async(req, res) => {
    let events = await Event.findAll({
        include:[
            {
                model: Ticket,
                as: "tickets"
            }
        ],
        order: [
            ["id", "ASC"],
            [{ model: Ticket, as: "tickets" }, 'price', 'ASC']
        ],
        raw: false
    });

    return res.status(200).json({
        message: 'all events!',
        results: events,
        error: false
    });
}

exports.getEvent = async(req, res) => {
    const {slug} = req.params;
    let event = await Event.findOne({
        where: {slug: slug},
        include:[
            {
                model: Ticket,
                as: "tickets"
            }
        ],
        order: [[{ model: Ticket, as: "tickets" }, 'price', 'ASC']],
        raw: false
    });

    return res.status(200).json({
        message: 'event details!',
        results: event,
        error: false
    });
}

exports.showEvent = async(req, res) => {
    const {slug} = req.params;
    let event = await Event.findOne({
        where: {slug: slug},
        include:[
            {
                model: Ticket,
                as: "tickets"
            }
        ],
        order: [[{ model: Ticket, as: "tickets" }, 'price', 'ASC']],
        raw: false
    });

    return res.render('event', {event});
}

exports.ticketCheckout = async(req, res) => {
    const { slug } = req.params;
    const { data } = req.query;
    const decodedString = decodeURIComponent(data);
    const parsedObject = JSON.parse(decodedString);
    const total = parsedObject.reduce((acc, obj) => acc + obj.total, 0);

    let event = await Event.findOne({
        where: {slug: slug}
    }); 

    return res.render('checkout', {tickets: parsedObject, total, event});
}

exports.bookTicket = async(req, res) => {
    const {eventId} = req.params;
    const {email, firstname, lastname, phone, tickets, total } = req.body;
    let event = await Event.findOne({
        where: {id: eventId}
    }); 

    try{
        await sequelize.transaction(async function(transaction) {
            const attendee = await Attendee.create({
                email, 
                firstname, 
                lastname,
                phone,
                event_id: event.id
            }, {transaction});

            let reference = generateReference(attendee.id)
            let transactions = await Transaction.create({ 
                attendee_id: attendee.id,
                event_id: event.id,
                total: total,
                reference
            }, {transaction});

            const createOrderPromises = tickets.map(async(ticket) => {
                await Order.create({ 
                    transaction_id: transactions.id,
                    ticket_id: ticket.id,
                    amount: ticket.price,
                    quantity: ticket.quantity,
                    total: ticket.total,
                }, {transaction});
            });

            // Wait for all promises to resolve
            await Promise.all(createOrderPromises);

            const payResult = await pay({"email": email, "amount": total, reference});
            let result = JSON.parse(payResult);
            return res.status(200).json({
                message: 'Payment url generated successfully',
                results: result.data?.authorization_url,
                error: false
            });
        });
    }catch(error){
        return res.status(500).json({
            message: "could not book ticket, please try again later",
            error: true
        });
    }
}

exports.confirmPayment = async(req, res) => {
    var { reference } = req.query;
    var transaction = await Transaction.findOne({
        where: {reference}
    });

    if(Object.is(transaction, null)){
        res.status(422).json({
            message: 'Order reference verification failed',
            results: transaction,
            error: true
        });
    }else{
        getPaymentData(reference)
        .then(data => {
            let result = JSON.parse(data);
            let status = result["data"]["status"];

            async function updateOrder(){
                if(status == "success"){
                    transaction.status = result.data.status;
                    transaction.verified = true;
                    transaction.received = result["data"]["amount"] / 100;
                    //await transaction.save();

                    /*await sendMail({
                        email: attendee.email,
                        subject: event.title,
                        template: "test-mail.ejs",
                        data: attendee
                    });*/

                    return res.status(200).json({
                        message: 'Order reference verification successful',
                        results: transaction,
                        error: false
                    });
                }
            };
            updateOrder();
        }).catch(err => {
            return res.status(500).json({
                message: 'Order verification failed',
                results: err,
                error: true
            });
        });
    }
}