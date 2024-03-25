module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        attendee_id: {
            type: DataTypes.BIGINT(20).UNSIGNED, 
            foreignKey: true,
            references: {
                model: {tableName: 'attendees'},
                key: 'id'
            },
            allowNull: false
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
        total: {type: DataTypes.INTEGER, allowNull: false},
        reference: {type: DataTypes.STRING, unique: true},
        status: {type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending'},
        verified: {type: DataTypes.BOOLEAN, defaultValue: 0},
        received: {type: DataTypes.INTEGER, defaultValue: null}
    },{
        tableName: 'transactions'
    })

    return Transaction;
}