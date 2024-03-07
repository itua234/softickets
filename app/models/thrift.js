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

module.exports = (sequelize, DataTypes) => {
    const Thrift = sequelize.define('Thrift', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        creator_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            foreignKey: true,
            references: {
                model: {tableName: 'users'},
                key: 'id'
            },
            allowNull: false
        },
        code: {type: DataTypes.STRING, allowNull: false},
        amount: {type: DataTypes.INTEGER, allowNull: false},
        slots: {type: DataTypes.INTEGER, allowNull: false},
        group_chat: {type: DataTypes.STRING, allowNull: true},
        currency_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            foreignKey: true,
            references: {
                model: {tableName: 'currencies'},
                key: 'id'
            },
            allowNull: false
        },
        returns: {type: DataTypes.INTEGER, allowNull: false},
        startDate: {type: DataTypes.DATE, allowNull: true},
        endDate: {type: DataTypes.DATE, allowNull: true},
        type: {type: DataTypes.ENUM('weekly', 'monthly', 'daily')},
        status: {type: DataTypes.ENUM('pending', 'active', 'completed'), defaultValue: 'pending'}
        //isVerified: {type: DataTypes.BOOLEAN, defaultValue: false},
    },{
        tableName: 'thrifts'
    })

    return Thrift;
}