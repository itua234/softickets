const { sequelize, models: { User, Notification, Currency, Thrift } } = require('../../models');
const { resolve } = require('../../util/payment');
require('dotenv').config();

exports.verify_account = async(req, res) => {
    const {account, code} = req.params;
    
    resolve(account, code)
    .then(data => {
        let result = JSON.parse(data);

        return res.status(200).json({
            message: result.message,
            results: result["data"],
            error: !result["status"]
        });
    }).catch(err => {
        return res.status(500).json({
            message: 'Account number could not be verified!',
            results: err,
            error: true
        });
    })
}

exports.getCurrencies = async(req, res) => {
    let currencies = await Currency.findAll();

    return res.status(200).json({
        message: 'Curencies::',
        results: currencies,
        error: false
    });
}

exports.createThrift = async(req, res) => {
    const { amount, slots, group_chat, currency_id, type, startDate } = req.body;

    let thrift = await Thrift.create({
        creator_id: req.user.id,
        code: "jdjdjdj",
        amount, 
        group_chat,
        slots,
        currency_id,
        returns: parseInt(slots) * parseInt(amount),
        type,
        startDate
    });

    return res.status(200).json({
        message: 'Curencies::',
        results: thrift,
        error: false
    });
}

exports.joinThrift = async(req, res) => {
    const {thriftId} = req.params;
    const {date} = req.body;

    let thrift = await Thrift.findOne({
        where: {
            id: thriftId
        }
    });

    return res.status(200).json({
        message: 'Curencies::',
        results: thrift,
        error: false
    });
}