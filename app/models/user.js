const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        uuid: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
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
        },
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
    })

    User.prototype.notify = async function (notification) {
        const user = this.dataValues;
        //Notify logic with the notification instance
        await notification.send(user);
    }

    User.prototype.readNotifications = async function () {
        const user = this.dataValues;
        const Notification = sequelize.models.Notification;
        let notifications = await Notification.scope('read').findAll({
            where: {
                notifiable_id: user.id,
                type: this.constructor.name
            }
        });
        return notifications;
    }

    User.prototype.unReadNotifications = async function () {
        const user = this.dataValues;
        const Notification = sequelize.models.Notification;
        let notifications = await Notification.scope('unRead').findAll({
            where: {
                notifiable_id: user.id,
                type: this.constructor.name
            }
        });
        return notifications;
    }

    User.prototype.markAsRead = async function () {
        const notifications = await this.getUnreadNotifications();
        for (let notification of notifications) {
            await notification.markAsRead();
        }
    };

    // Define relationships
    User.associate = models => {
        //User.belongsToMany(models.Event, {through: models.Attendee, foreignKey: 'user_id', otherKey: 'event_id', as: "eventsAttending"});
    };

    return User;
}