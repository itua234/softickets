import Sequelize from 'sequelize';
import dbConfig from '../../config/db-config';
const sequelize = new Sequelize(
    dbConfig.DATABASE, 
    dbConfig.USER, 
    dbConfig.PASSWORD, 
    {
        dialect: dbConfig.DIALECT,
        host: dbConfig.HOST
    }
);

const InvestmentOffer = require('./investment_offer')(sequelize, Sequelize.DataTypes);
//const Review = require('./review')(sequelize, Sequelize.DataTypes);

export default (sequelize, DataTypes) => {
    const Investment = sequelize.define('Investment', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        units: {type: DataTypes.INTEGER},
        price: {type: DataTypes.INTEGER},
        type: {type: DataTypes.INTEGER},
        unitType: {type: DataTypes.INTEGER},
        payoutType: {type: DataTypes.INTEGER},
        returns: {type: DataTypes.INTEGER},

        startDate: {type: DataTypes.DATE},
        duration: {type: DataTypes.STRING},
        maturityDate: {type: DataTypes.DATE},
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM(
                'pending', 
                'active', 
                'matured'
            ),
            defaultValue: 'pending'
        },
    },{
        tableName: 'investments'
    })

    Investment.hasMany(InvestmentOffer, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        foreignKey: 'investment_id',
        targetKey: 'id'
    });

    return Investment;
}