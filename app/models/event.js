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

const Ticket = require('./ticket')(sequelize, Sequelize.DataTypes);
const Category = require('./category')(sequelize, Sequelize.DataTypes);
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Attendee = require('./attendee')(sequelize, Sequelize.DataTypes);
const Transaction = require('./transaction')(sequelize, Sequelize.DataTypes);

module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        //uuid: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        title: {type: DataTypes.STRING, allowNull: false},
        slug: {type: DataTypes.STRING, allowNull: false},
        creator_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            foreignKey: true,
            references: {
                model: {tableName: 'users'},
                key: 'id'
            },
            allowNull: false
        },
        category_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
        description: {type: DataTypes.TEXT, allowNull: false},
        image: {type: DataTypes.STRING, allowNull: false},
        venue: {type: DataTypes.STRING, allowNull: false},
        isPrivate: {type: DataTypes.BOOLEAN, defaultValue: false},
        startDate: {type: DataTypes.DATE, allowNull: true},
        endDate: {type: DataTypes.DATE, allowNull: true}
    },{
        tableName: 'events'
    })

    Event.belongsTo(Category, {
        foreignKey: 'category_id',
        targetKey: 'id',
        as: "category"
    });
    Event.hasMany(Ticket, {
        foreignKey: 'event_id',
        targetKey: 'id',
        as: "tickets"
    });
    /*Event.belongsToMany(User, {
        through: Attendee,
        foreignKey: 'event_id',
        otherKey: 'user_id',
        as: 'attendees', // Alias for the association
    });*/
    Event.hasMany(Attendee, {
        foreignKey: 'event_id',
        targetKey: 'id',
        as: "attendees"
    });
    Event.hasMany(Transaction, {
        foreignKey: 'event_id',
        targetKey: 'id',
        as: "transactions"
    });

    Event.prototype.attendees = async function () {
        const event = this.dataValues;
        let data = await Event.findByPk(event.id, {
            include:[
                {
                    model: User,
                    as: "attendees"
                }
            ],
            raw: false
        })
        return data.attendees;
    }

    Event.prototype.transactions = async function () {
        const event = this.dataValues;
        let transactions = await Transaction.findAll({
            where: {
                event_id: event.id
            }
        })
        return transactions;
    }

    return Event;
}