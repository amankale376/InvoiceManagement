require('dotenv').config({path:'../config/.env'})
const jwt = require('jsonwebtoken')
const flags = require('../config/flag_responses')


const auth = async (req, res , next) =>{
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.USER_SECRET)
        const user = await User.findOne({token})
        !user?flags('Wrong Token!', undefined, req, res):null
        console.log(user)
         req.token = token
         req.user = user
        next()
    } catch (error) {
      flags(error, undefined , req ,res)
    }
}
module.exports = auth