const { sequelize, models: { User } } = require('../models');
const {Op} = require('sequelize');
const {QueryTypes} = require('sequelize');
const {returnValidationError} = require("../util/helper");

const niv = require('node-input-validator');
niv.extend('hasSpecialCharacter', ({value}) => {
    if(!value.match(/[^a-zA-Z0-9]/)){
        //Return an error if the value does not contain a special character
        return false;
    }
    return true;
})
niv.extend('containsNumber', ({value}) => {
    if(!value.match(/\d/)){
        //Return an error if the value does not contain a special character
        return false;
    }
    return true;
})
niv.extend('isSingleWord', ({value}) => {
    if(value.includes(" ")){
        //Return an error if the value does not contain a special character
        return false;
    }
    return true;
})
niv.extend('unique', async ({value, args}) => {
    const field = args[1] || attr;
    let emailExist;
    if(args[2]){
        emailExist = await sequelize.query(`SELECT * FROM ${args[0]} WHERE ${field}=? AND id != ? LIMIT 1`,{
            replacements: [value, args[2]],
            type: QueryTypes.SELECT
        })
    }else{
        emailExist = await sequelize.query(`SELECT * FROM ${args[0]} WHERE ${field}=? LIMIT 1`,{
            replacements: [value],
            type: QueryTypes.SELECT
        })
    }
    
    if(emailExist.length !== 0){
        return false;
    }
    return true;
})
niv.extend('exists', async ({attr, value, args}) => {
    const field = args[1] || attr;
    let emailExist = await sequelize.query(`SELECT * FROM ${args[0]} WHERE ${field}=? LIMIT 1`,{
        replacements: [value],
        type: QueryTypes.SELECT
    })
    if(emailExist.length === 0){
        return false;
    }
    return true;
})
niv.extend('confirmed', async ({attr, value}, validator) => {
    const field = [attr]+'_confirmation';
    let secondValue = validator.inputs[field]
    if(value !== secondValue){
        return false;
    }
    return true;
})
niv.extendMessages({
    hasSpecialCharacter: 'The :attribute field must have a special character',
    containsNumber: 'The :attribute field must contain a number',
    isSingleWord: 'The :attribute field must be a single word',
    exists: 'The selected :attribute is invalid.'
})

//export the schemas
module.exports = {
    createTicketSchema: async(req, res, next) => {
        req.body.image = req.file || {};
        const v = new niv.Validator(req.body, {
            name: 'required|string',
            quantity: 'required|integer',
            price: 'required|integer',
            purchase_limit: 'required|integer',
            is_free: 'required|integer',
            currency_id: 'required|integer',
            image: 'required|mime:jpeg,jpg,svg,png,pdf|size:2mb'
        }, {'currency_id.integer': "The currency field is required"});

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "failed to create new ticket");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },
    editTicketSchema: async(req, res, next) => {
        req.body.image = req.file || null;
        const v = new niv.Validator(req.body, {
            name: 'required|string',
            quantity: 'required|integer',
            price: 'required|integer',
            purchase_limit: 'required|integer',
            is_free: 'required|integer',
            currency_id: 'required|integer',
            image: 'nullable|mime:jpeg,jpg,svg,png,pdf|size:2mb'
        }, {'currency_id.integer': "The currency field is required"});

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "failed to edit ticket");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    }
}