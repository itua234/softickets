const { sequelize, models: { User, Notification, Currency, Thrift } } = require('../../models');
const { resolve, getBankList } = require('../../util/payment');
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

exports.getBanks = async(req, res) => {
    let banks = JSON.parse(await getBankList());

    return res.status(200).json({
        message: 'Banks:',
        results: banks["data"],
        error: false
    });
}