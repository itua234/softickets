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

const db = {};
db.sequelize = sequelize;
db.models = {};
db.models.User = require('./user')(sequelize, Sequelize.DataTypes);
db.models.Otp = require('./otp')(sequelize, Sequelize.DataTypes);
db.models.Notification = require('./notification')(sequelize, Sequelize.DataTypes);
db.models.Currency = require('./currency')(sequelize, Sequelize.DataTypes);
db.models.Thrift = require('./thrift')(sequelize, Sequelize.DataTypes);
db.models.Wallet = require('./wallet')(sequelize, Sequelize.DataTypes);
db.models.Category = require('./category')(sequelize, Sequelize.DataTypes);
db.models.Event = require('./event')(sequelize, Sequelize.DataTypes);
db.models.Ticket = require('./ticket')(sequelize, Sequelize.DataTypes);
db.models.Attendee = require('./attendee')(sequelize, Sequelize.DataTypes);
db.models.Transaction = require('./transaction')(sequelize, Sequelize.DataTypes);

module.exports = db;
