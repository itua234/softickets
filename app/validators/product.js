const { sequelize, models: { User } } = require('../models');
const {Op} = require('sequelize');
const {QueryTypes} = require('sequelize');
const {returnValidationError} = require("../util/helper");
const { auth } = require("../middleware/auth") ;
const fs = require("fs");
const path = require("path");

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
niv.extend('unique', async ({attr, value, args}) => {
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

const multer = require('multer');
//export the schemas
module.exports = {
    createProductSchema: async(req, res, next) => {
        req.body.images = req.files || [];
        const v = new niv.Validator(req.body, {
            name: 'required|string',
            brand: 'required|string',
            stock: 'required|integer',
            price: 'required|integer',
            description: 'required|string',
            category_id: 'required|integer',
            images: 'required|array',
           "images.*": 'required|mime:jpeg,jpg,svg,png|size:2mb'
        }, {'category_id.integer': "The category field is required"});

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            let images = req.body.images;
            if(images.length !== 0){
                images.forEach(async(image) => {
                    //url: "/images/uploads/" + image.filename
                    const filename = image.filename;
                    const filePath = path.join(__dirname, "..", "public", "images", "uploads", filename);

                    //Check if the file exists
                    if(fs.existsSync(filePath)){
                        //Delete the file
                        fs.unlinkSync(filePath);
                    }
                });
            }
            returnValidationError(errors, res, "failed to add new product");
        }else{
            if(!req.value){
                req.value = {}
            }

            req.body = v.inputs;
            next();
        }
    },
    updateProductSchema: async(req, res, next) => {
        req.body.images = req.files || [];
        const v = new niv.Validator(req.body, {
            name: 'required|string',
            brand: 'required|string',
            stock: 'required|integer',
            price: 'required|integer',
            description: 'required|string',
            category_id: 'required|integer',
            images: 'array',
           "images.*": 'mime:jpeg,jpg,svg,png|size:2mb'
        }, {'category_id.integer': "The category field is required"});

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            let images = req.body.images;
            if(images.length !== 0){
                images.forEach(async(image) => {
                    //url: "/images/uploads/" + image.filename
                    const filename = image.filename;
                    const filePath = path.join(__dirname, "..", "public", "images", "uploads", filename);

                    //Check if the file exists
                    if(fs.existsSync(filePath)){
                        //Delete the file
                        fs.unlinkSync(filePath);
                    }
                });
            }
            returnValidationError(errors, res, "failed to update product");
        }else{
            if(!req.value){
                req.value = {}
            }

            req.body = v.inputs;
            next();
        }
    },
    createCategorySchema: async(req, res, next) => {
        //req.body.images = req.files || [];
        const v = new niv.Validator(req.body, {
            name: 'required|string'   
        });

        let matched = await v.check();
        if(!matched){
            let errors = v.errors;
            returnValidationError(errors, res, "failed to create new category");
        }else{
            if(!req.value){
                req.value = {}
            }

            req.body = v.inputs;
            next();
        }
    },

}