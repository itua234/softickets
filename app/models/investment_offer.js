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

export default (sequelize, DataTypes) => {
    const InvestmentOffer = sequelize.define('InvestmentOffer', {
        user_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false
        },
        investment_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false
        },
        units: {type: DataTypes.INTEGER},
        price: {type: DataTypes.INTEGER},
        validity: {type: DataTypes.DATE}
    },{
        tableName: 'offers'
    })

    return InvestmentOffer;
}