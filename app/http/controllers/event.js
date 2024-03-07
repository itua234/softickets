const { sequelize, models: { 
    Notification, Transaction,
    Currency, Event, 
    Ticket, Attendee, 
} } = require('../../models');
const { slugify, generateReference, sendMail, useTermii } = require('../../util/helper');
const { upload } = require('../../services/cloudinary');
require('dotenv').config();

exports.createEvent = async(req, res) => {
    const { title, categoryId, description, venue, isPrivate, startDate, endDate } = req.body;
    const {url} = await upload(req.file.path)

    let event = await Event.create({
        creator_id: req.user.id,
        category_id: categoryId,
        title,
        description, 
        venue, 
        isPrivate: parseInt(isPrivate),
        image: url,
        slug: slugify(title),
        startDate,
        endDate
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
            //startDate: ticket.startDate,
            //endDate: ticket.endDate
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
        /*where: {},
        include:[
            {
                model: User,
                as: "attendees"
            }
        ],
        raw: false*/
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
        /*include:[
            {
                model: User,
                as: "attendees"
            }
        ],
        raw: false*/
    });
    return res.json(await event.transactions());

    return res.status(200).json({
        message: 'event details!',
        results: event,
        error: false
    });
}

exports.bookTicket = async(req, res) => {
    const {email, firstname, lastname, phone, event_id, ticket_id, amount, quantity } = req.body;
    let event = await Event.findOne({
        where: {id: event_id}
    });

    try{
        await sequelize.transaction(async function(transaction) {
            const attendee = await Attendee.create({
                email, 
                firstname, 
                lastname,
                phone,
                event_id
            }, {transaction});
        
            await Transaction.create({ 
                attendee_id: attendee.id,
                event_id,
                ticket_id,
                amount,
                quantity, 
                total: parseInt(amount) * parseInt(quantity),
                reference: generateReference(attendee.id)
            }, {transaction});

            await sendMail({
                email: attendee.email,
                subject: event.title,
                template: "test-mail.ejs",
                data: attendee
            });
            
            return res.status(201).json({
                message: 'Thanks for signing up! Please check your email to complete your registration.',
                results: user.email,
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