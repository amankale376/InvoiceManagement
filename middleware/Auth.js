require('dotenv').config({path:'../config/.env'})
const jwt = require('jsonwebtoken')
const flags = require('../config/flag_responses')
const User = require('../models/userModel')
const mongoose = require("mongoose")

const auth = async (req, res , next) =>{
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify( token, process.env.USER_SECRET)
        const id = mongoose.Types.ObjectId(decoded._id)
        const user = await User.findOne({_id:id , token:token})
        !user?flags('Wrong Token!', undefined, req, res):null
         req.token = token
         req.user = user
         console.log(req.user)
        next()
    } catch (error) {
      flags(error, undefined , req ,res)
    }
}
module.exports = auth