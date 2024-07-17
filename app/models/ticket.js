const {modifyTime} = require("../util/helper");
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

    Ticket.associate = models => {
        Ticket.hasMany(models.Transaction, {foreignKey: 'ticket_id', targetKey: 'id', as: "transactions"});
        Ticket.belongsTo(models.Currency, {foreignKey: 'currency_id', targetKey: 'id', as: "currency"});
    }

    return Ticket;
}