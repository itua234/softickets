const { sequelize, models: { 
    Notification, Transaction, User,
    Currency, Event, Category, Wallet,
    Ticket, Attendee, Order
} } = require('../../models');
const Sequelize = require('sequelize');
const { slugify, generateReference, sendMail, useTermii } = require('../../util/helper');
const { pay, getPaymentData, getBankList, resolve } = require('../../util/payment');
const { upload } = require('../../services/cloudinary');
const { escape } = require('querystring');
const crypto = require('crypto');
const secretKey = process.env.PAYSTACK_SECRET;
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
    //const {url} = await upload(req.file.path)

    let ticket = await Ticket.create({
        event_id: eventId,
        name: name,
        price: price,
        quantity: quantity,
        purchase_limit: parseInt(purchase_limit),
        currency_id: currency_id,
        is_free: parseInt(is_free)
        //image: url
    });

    return res.status(200).json({
        message: 'Your event has been created:',
        results: ticket,
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
    const events = await Event.findAll({
        include: [
            {
                model: Ticket,
                as: "tickets",
                include:[
                    {
                        model: Currency,
                        as: "currency"
                    }
                ]
            }
        ],
        /*where: {
            '$tickets.id$': { [Sequelize.Op.ne]: null } // Tickets exist
        },
        having: Sequelize.literal('COUNT(tickets.id) > 0'), // Tickets count > 0*/
        order: [
            ["id", "ASC"],
            [{ model: Ticket, as: "tickets" }, 'price', 'ASC']
        ],
        //group: ['Event.id'], // Group by event to count tickets per event
        //subQuery: false, // Prevent Sequelize from generating a subquery
        raw: false
    });

    return res.status(200).json({
        message: 'all events!',
        results: events,
        error: false
    });
}

exports.getEventsByCategory = async(req, res) => {
    const {categoryId} = req.params;
    const events = await Event.findAll({
        include: [
            {
                model: Ticket,
                as: "tickets",
                include:[
                    {
                        model: Currency,
                        as: "currency"
                    }
                ]
            }
        ],
        where: {
            category_id: categoryId,
            '$tickets.id$': { [Sequelize.Op.ne]: null } // Tickets exist
        },
        having: Sequelize.literal('COUNT(tickets.id) > 0'), // Tickets count > 0
        order: [
            ["id", "ASC"],
            [{ model: Ticket, as: "tickets" }, 'price', 'ASC']
        ],
        group: ['Event.id'], // Group by event to count tickets per event
        raw: false
    });

    return res.status(200).json({
        message: 'events!',
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
                as: "tickets",
                include:[
                    {
                        model: Currency,
                        as: "currency"
                    }
                ]
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
                as: "tickets",
                include:[
                    {
                        model: Currency,
                        as: "currency"
                    }
                ]
            }
        ],
        order: [[{ model: Ticket, as: "tickets" }, 'price', 'ASC']],
        raw: false
    });

    return res.render('event', {event});
}

exports.showIndex = async(req, res) => {
    let categories = await Category.findAll({});

    return res.render('index', {categories});
}

exports.showCheckou = async(req, res) => {
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

exports.showCheckout = async(req, res) => {
    const { id } = req.params;
    let ticket = await Ticket.findOne({
        where: {id: id},
        include:[
            {
                model: Currency,
                as: "currency"
            }
        ],
        raw: false
    }); 
    let event = await Event.findOne({
        where: {id: ticket.event_id}
    });
    //return res.json(ticket);

    return res.render('checkout', {ticket, event});
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
                reference,
                status: (total == 0) ? "success" : "pending",
                verified: (total == 0) ? true : false,
                received: (total == 0) ? 0 : null
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

            if(total == 0){
                return res.status(200).json({
                    message: 'Ticket has been sent successfully',
                    results: "/dashboard/account",
                    error: false
                });
            }
            //const payResult = await pay({"email": email, "amount": total, reference});
            //let result = JSON.parse(payResult);
            let data = {
                key: process.env.PAYSTACK_PUBLIC,
                email: attendee.email,
                amount: total,
                reference: transactions.reference
            }
            return res.status(200).json({
                message: 'Payment data generated successfully',
                results: data,
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

const calculateCommission = (orders) => {
    let total = 0;

    for (const order of orders) {
        for (let i=0; i<order.quantity; i++) {
            if (order.amount !== 0) { // Check if the price is not zero
                let commission = (order.amount * 5 / 100) + 100;
                let balance = order.amount - commission;
                total += balance;
            }
        }
    }

    return total;
}

exports.confirmPayment = async(req, res) => {
    let reference = req.query.reference;
    var transaction = await Transaction.findOne({ where: {reference} });
    let orders = await Order.findAll({ where: {transaction_id: transaction.id} });
    let event = await Event.findOne({ where: {id: transaction.event_id} });
    let wallet = await Wallet.findOne({ where: {user_id: event.creator_id} });

    if(transaction){
        if(!transaction.verified){
            let result = JSON.parse(await getPaymentData(reference));
            let status = result["data"]["status"];

            async function updateOrder(){
                if(status == "success"){
                    transaction.status = "success";
                    transaction.verified = true;
                    transaction.received = result["data"]["amount"] / 100;
                    await transaction.save();

                    wallet.balance += calculateCommission(orders)
                    await wallet.save();

                    /*await sendMail({
                        email: attendee.email,
                        subject: event.title,
                        template: "test-mail.ejs",
                        data: attendee
                    });*/

                    return res.status(200).json({
                        message: 'Funding Successful!',
                        results: null,
                        error: false
                    });
                }else if(status == "abandoned"){
                    transaction.status = "failed";
                    transaction.verified = true;
                    await transaction.save();

                    return res.status(200).json({
                        message: 'Funding Successful!',
                        results: null,
                        error: false
                    });
                }
            };
            updateOrder();
        }else {
            // Transaction is already verified
            return res.status(200).json({
                message: 'Transaction already verified',
                results: null,
                error: false
            });
        }
    }
}

exports.paymentWebhook = async(req, res) => {
    //validate event
    //return res.json(crypto.createHmac('sha512', secretKey).update(JSON.stringify(req.body)).digest('hex'));
    const hash = crypto.createHmac('sha512', secretKey).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        const event = req.body.event;
        let reference = req.body.data.reference;

        switch(event){
            case "charge.success":
                let paymentData = JSON.parse(await getPaymentData(reference));
                let amount = paymentData["data"]["amount"]  / 100;
                
                if(paymentData["data"]["status"] == "success"){
                    let transaction = await Transaction.findOne({ where: {reference} });
                    let orders = await Order.findAll({ where: {transaction_id: transaction.id} });
                    let event = await Event.findOne({ where: {id: transaction.event_id} });
                    let wallet = await Wallet.findOne({ where: {user_id: event.creator_id} });
                    if(transaction){
                        if(!transaction.verified){
                            transaction.status = "success";
                            transaction.verified = true;
                            transaction.received = amount;
                            await transaction.save();

                            wallet.balance += calculateCommission(orders)
                            await wallet.save();
                            /*if(user.fcmToken){
                                var payload = {
                                    notification: {
                                        "title": "Transaction Successful",
                                        "body": `your transaction was successful`
                                    },
                                    token: user.fcmToken
                                };
                                await sendPushNotification(payload);
                            }*/
                        }
                    }
                }
            break;
        }
    }

    res.send(200);
}

exports.showCreateEventForm = async(req, res) => {
    let categories = await Category.findAll({}); 
    let currencies = await Currency.findAll({}); 
    res.render('user/create-event', { user: req.session.user, categories, currencies });
}

exports.showBankPayoutForm = async(req, res) => {
    res.render('user/payment', { user: req.session.user});
}

exports.showEvents = async(req, res) => {
    let events = await Event.findAll({
        where: {creator_id: req.session.user.id},
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
    /*for(let event of events){
        let transactions = await Transaction.findAll({
            where: {event_id: event.id, status: "success", verified: true}
        });
        for(let transaction of transactions){
            let orders = await Order.findAll({
                where: {transaction_id: transaction.id}
            })
            event.dataValues.amount_sold = 0; 
            for(let order of orders){
                event.dataValues.amount_sold += order.quantity;
            }
        }
    }*/

    res.render('user/events', { user: req.session.user, events });
}

exports.showEventTickets = async(req, res) => {
    let {uuid} = req.params;
    let events = await Event.findAll({}); 
    res.render('user/events', { user: req.session.user, events });
}