module.exports = (sequelize, DataTypes) => {
    const Currency = sequelize.define('Currency', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {type: DataTypes.STRING, allowNull: false},
        symbol: {type: DataTypes.STRING}
    },{
        tableName: 'currencies'
    })

    return Currency;
}