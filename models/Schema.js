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
    password:{type:String,required:true}
})

module.exports=mongoose.model('login',Schema);