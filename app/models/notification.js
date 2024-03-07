const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        type: {type: DataTypes.STRING, allowNull: false},
        notifiable_type: {type: DataTypes.STRING, allowNull: false},
        notifiable_id: {type: DataTypes.BIGINT(20).UNSIGNED, foreignKey: true, allowNull: false},
        data: {
            type: DataTypes.TEXT, 
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('data');
                return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
                this.setDataValue('data', JSON.stringify(value));
            }
        },
        read_at: {type: DataTypes.DATE, allowNull: true}
    })

    Notification.addScope('read', {
        where: {
            read_at: {
                [Sequelize.Op.not]: null
            }
        },
        order: [['createdAt', 'ASC']]
    });
    Notification.addScope('unRead', {
        where: {
            read_at: {
                [Sequelize.Op.is]: null
            }
        },
        order: [['createdAt', 'ASC']]
    });

    return Notification;
}