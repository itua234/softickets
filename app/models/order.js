module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        ticket_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
        transaction_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
        amount: {type: DataTypes.INTEGER, allowNull: false},
        quantity: {type: DataTypes.INTEGER, allowNull: false},
        total: {type: DataTypes.INTEGER, allowNull: false},
        //verified: {type: DataTypes.BOOLEAN, defaultValue: 0}
    },{
        tableName: 'orders'
    })

    return Order;
}