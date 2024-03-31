const {modifyTime} = require("../util/helper");
const Sequelize = require('sequelize');
const dbConfig = require('../../config/db-config');
const sequelize = new Sequelize(
    dbConfig.DATABASE, 
    dbConfig.USER, 
    dbConfig.PASSWORD, 
    {
        dialect: dbConfig.DIALECT,
        host: dbConfig.HOST
    }
);

const Attendee = require('./attendee')(sequelize, Sequelize.DataTypes);
const Transaction = require('./transaction')(sequelize, Sequelize.DataTypes);

module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define('Ticket', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        event_id: {
            type: DataTypes.BIGINT(20).UNSIGNED, 
            foreignKey: true,
            references: {
                model: {tableName: 'events'},
                key: 'id'
            },
            allowNull: false
        },
        name: {type: DataTypes.STRING, allowNull: false},
        price: {type: DataTypes.INTEGER, defaultValue: 0},
        quantity: {type: DataTypes.INTEGER, defaultValue: 0},
        purchase_limit: {type: DataTypes.INTEGER, defaultValue: 0},
        //image: {type: DataTypes.STRING, allowNull: false},
        currency_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            foreignKey: true,
            references: {
                model: {tableName: 'currencies'},
                key: 'id'
            },
            allowNull: false
        },
        is_free: {type: DataTypes.BOOLEAN, defaultValue: 0}
    },{
        tableName: 'tickets'
    })

    Ticket.hasMany(Transaction, {
        foreignKey: 'ticket_id',
        targetKey: 'id',
        as: "transactions"
    });

    return Ticket;
}