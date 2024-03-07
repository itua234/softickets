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
    register: async(req, res, next) => {
        const v = new niv.Validator(req.body, {
            email: 'required|string|email|unique:users,email',
            name: 'required|string',
            password: 'required|string|minLength:8|hasSpecialCharacter|containsNumber',
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "user onboarding failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },

    send_code: async(req, res, next) => {
        const v = new niv.Validator(req.params, {
            email: 'required|string|email|exists:users,email',
            purpose: 'required|string'
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "unable to send code at this time...");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },

    verify_email: async(req, res, next) => {
        const v = new niv.Validator(req.params, {
            email: 'required|string|email|exists:users,email',
            code: 'required|digits:4',
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "email verification failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },

    login: async(req, res, next) => {
        const v = new niv.Validator(req.body, {
            email: 'required|email',
            password: 'required|string',
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "Login failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },

    verifyForgotPasswordTokenSchema: async(req, res, next) => {
        const v = new niv.Validator(req.params, {
            email: 'required|string|email|exists:users,email',
            code: 'required|digits:4'
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "password reset token verification failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },
 
    resetPasswordSchema: async(req, res, next) => {
        const v = new niv.Validator(req.body, {
            email: 'required|string|email|exists:users,email',
            password: 'required|string|minLength:8|hasSpecialCharacter|containsNumber|confirmed',
            password_confirmation: 'required'
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "password reset failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    },

    changePasswordSchema: async(req, res, next) => {
        const v = new niv.Validator(req.body, {
            current_password: 'required|string',
            password: 'required|string|minLength:8|hasSpecialCharacter|containsNumber|confirmed',
            password_confirmation: 'required'
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "Oops!, password change failed");
        }else{
            if(!req.value){
                req.value = {}
            }
            req.body = v.inputs;
            next();
        }
    }
}