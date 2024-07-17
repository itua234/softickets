const Sequelize = require('sequelize');
const env = process.env.APP_ENV || "development";
const config = require('../../config/config')[env];
let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
}else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.models = {};

// Import all models
const modelDefiners = [
    require('./user'),
    require('./otp'),
    require('./notification'),
    require('./currency'),
    require('./order'),
    require('./wallet'),
    require('./category'),
    require('./event'),
    require('./ticket'),
    require('./attendee'),
    require('./transaction')
];
// Define all models
modelDefiners.forEach(modelDefiner => {
    const model = modelDefiner(sequelize, Sequelize.DataTypes, Sequelize);
    console.log(`Model ${model.name} initialized.`);
    db.models[model.name] = model;
});
// Establish relationships
Object.keys(db.models).forEach(modelName => {
    if (db.models[modelName].associate) {
        console.log(`Setting up associations for ${modelName}`);
        db.models[modelName].associate(db.models);
    }
});

module.exports = db;