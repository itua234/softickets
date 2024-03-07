module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define('Wallet', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            foreignKey: true,
            references: {
                model: {tableName: 'users'},
                key: 'id'
            },
            allowNull: false
        },
        balance: {type: DataTypes.INTEGER, allowNull: false}
    },{
        tableName: 'wallets'
    })

    return Wallet;
}