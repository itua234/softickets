const {Op} = require('sequelize');
const { getCurrentDateTime } = require('../util/helper');
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
        date: {
            type: DataTypes.DATE, 
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('date');
                return rawValue ? getCurrentDateTime(rawValue) : null;
            }
        }
    },{
        tableName: 'events'
    });

    Event.addScope('upcoming', {
        where: {
            date: {
                [Op.gt]: Math.floor(Date.now()/1000)
            }
        },
        order: [['date', 'ASC']]
    });
    Event.addScope('passed', {
        where: {
            date: {
                [Op.lt]: Math.floor(Date.now()/1000)
            }
        }
    });

    Event.prototype.attendees = async function () {
        const event = this.dataValues;
        let attendees = await Attendee.findAll({
            where: {
                event_id: event.id
            }
        })
        return attendees;
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

    Event.associate = models => {
        Event.belongsTo(models.Category, {
            foreignKey: 'category_id',
            targetKey: 'id',
            as: "category"
        });
        Event.hasMany(models.Ticket, {
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
        Event.hasMany(models.Attendee, {
            foreignKey: 'event_id',
            targetKey: 'id',
            as: "attendees"
        });
        Event.hasMany(models.Transaction, {
            foreignKey: 'event_id',
            targetKey: 'id',
            as: "transactions"
        });
    }

    return Event;
}