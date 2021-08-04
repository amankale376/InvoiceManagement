require('dotenv').config({path:'../config/.env'})
const flags = require('../config/flag_responses')
const mongoose = require('mongoose')
const Validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')

const invoiceSchema = new mongoose.Schema({
    invoiceId:{
        type:String,
        require:true,
        unique:true,
        default:uuid()
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    items:[
        {
            item:String,
            price:Number,
            quantity:Number
        }
    ],
    cashier:{
        type:String,
        require:true
    },
    emailSent:{
        type:Boolean,
        require:true,
        default:false
    },
    tax:{
        type:String,
        require:true,
    },
    totalAmount:{
        type:String,
        require:true
    }

},{
    timestamps:true
})

const Invoice = mongoose.model('Invoice', invoiceSchema)
module.exports = Invoice

