require('dotenv').config({path:'./.env'})
const mongoose = require('mongoose')
const User = require('../models/userModel')

const InitialAdmin = async () =>{
    const isMatch = await User.findOne({UserType:'superadmin'}) 
    if(!isMatch) {
     try {
        const admin = {
            username:'SuperAdmin',
            email:'admin@gmail.com',
            password:process.env.SUPER_ADMIN_INITIAL_PASS,
            UserType:'superadmin'
        }
        const user = new User(admin)
         const savedUser = await user.save()
    } catch (error) {
        throw new Error(error)
    }
}
}

module.exports = InitialAdmin

