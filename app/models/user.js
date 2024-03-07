const bcrypt = require('bcrypt');
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

const Notification = require('./notification')(sequelize, Sequelize.DataTypes);

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        //uuid: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        /*firstname: {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('firstname');
                return rawValue ? rawValue : null;
            },
            set(value) {
                value = value.toLowerCase();
                const val = value.charAt(0).toUpperCase() + value.slice(1);
                this.setDataValue('firstname', val);
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('lastname');
                return rawValue ? rawValue : null;
            },
            set(value) {
                value = value.toLowerCase();
                const val = value.charAt(0).toUpperCase() + value.slice(1);
                this.setDataValue('lastname', val);
            }
        },*/
        name: {type: DataTypes.STRING, allowNull: true},
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('email');
                return rawValue ? rawValue : null;
            },
            set(value) {
                this.setDataValue('email', value.toLowerCase());
            }
        },
        phone: {type: DataTypes.STRING, unique: true, allowNull: true},
        password: {type: DataTypes.STRING, allowNull: true},
        fcm_token: {type: DataTypes.STRING, allowNull: true},
        gender: {type: DataTypes.STRING, allowNull: true},
        dob: {type: DataTypes.STRING, allowNull: true},
        country: {type: DataTypes.STRING, allowNull: true},
        referral_code: {type: DataTypes.STRING, unique: true, allowNull: false},
        code: {type: DataTypes.TEXT, allowNull: true},
        email_verified_at: {type: DataTypes.DATE}
    },{
        hooks: {
            beforeCreate: async (user) => {
                if(user.password){
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                };
            },
            beforeUpdate: async (user) => {
                if(user.changed('password')){
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    })

    /*User.belongsToMany(Event, {
        through: Attendee,
        foreignKey: 'user_id',
        otherKey: 'event_id',
        as: 'eventsAttending', // Alias for the association
    });*/

    User.prototype.notify = async function (notification) {
        const user = this.dataValues;
        //Notify logic with the notification instance
        await notification.send(user);
    }

    User.prototype.readNotifications = async function () {
        const user = this.dataValues;
        let notifications = await Notification.scope('read').findAll({
            where: {
                notifiable_id: user.id,
                notifiable_type: "user"
            }
        });
        return notifications;
    }

    User.prototype.unReadNotifications = async function () {
        const user = this.dataValues;
        let notifications = await Notification.scope('unRead').findAll({
            where: {
                notifiable_id: user.id,
                notifiable_type: "user"
            }
        });
        return notifications;
    }

    return User;
}