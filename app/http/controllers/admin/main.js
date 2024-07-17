const bcrypt = require('bcrypt');
const { sequelize, models: { User, Notification, Transaction } } = require('../../../models');
//const { generateOtp, sendMail } = require('../../../util/helper');
require('dotenv').config();

exports.getStatistics = async(req, res) => {
    let users = await User.count();
    let transactions = await Transaction.count();

    data = {
        users,
        transactions
    };

    return res.status(200).json({
        message: "Dashboard Data:",
        results: data,
        error: false
    });
}
