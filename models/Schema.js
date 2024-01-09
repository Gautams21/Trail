const mongoose = require("mongoose");
const validation= require('validator');
const Schema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true,
    validate(value){
        if(!validation.isEmail(value)){
            throw new Error("Email is Invalid!!!");
        }
    }},
    password:{type:String,required:true,
        validate: {
            validator: (value) => validation.isStrongPassword(value, {
                minLength: 8, // minimum length 8 characters
                minLowercase: 1, // minimum 1 lowercase letter
                minUppercase: 1, // minimum 1 uppercase letter
                minNumbers: 1, // minimum 1 number
                minSymbols: 1, // minimum 1 symbol
            }),
            message: 'Password is not strong enough.'
        }
    },
    resetPasswordToken: { type: String,default:'' },
    resetPasswordExpires: { type: Date,default:'' }
})


module.exports=mongoose.model('login',Schema);