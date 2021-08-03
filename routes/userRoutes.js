const express = require('express')
const router = express.Router()
const auth = require('../middleware/Auth')
const User = require('../models/userModel')
const flags = require('../config/flag_responses')
const generatePassword = require('password-generator')

router.post("/login",  async (req, res)=>{
try {
     const user = await User.findByCredentials(req.body.username , req.body.password)
    !user ? flags(undefined , 403 , req , res):null
    const token =  await user.generateAuthToken()
      if(user.initialSetup === false){
         res.send({
             token:token,
             message:'Use your token and Provide email, username and password in Patch request in /updateUser route to continue further'})
      }else{
         res.send({
             token:token,

             message:'You can use this token with your credentials to access further allowed functionalities'
         })
      }
} catch (error) {
flags(undefined , 401 , req ,res)
}
})

router.patch("/updateUser", auth , async (req , res)=>{
  
        const updates = Object.keys(req.body)
        const allowedUpdates =['username', 'email' , 'password']
        const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
        !isValidOperation? flags(undefined, 404, req, res):null

        try {
            updates.forEach((update)=>req.user[update] = req.body[update])
            req.user.initialSetup?null: req.user.initialSetup = true
            await req.user.save()
            res.send("Information Updated, You can get the information about facilities you can use further, In Login route")
    } catch (error) {
        flags(error, undefined, req, res)
    }
})

router.post("/createUser/:type", auth, async (req , res)=>{
    const type = req.params.type
    const {username , email} = req.body 

    if(req.user.UserType === 'cashier'){
        res.send("You are Not Authorized to use this feature")
    }else if(req.user.UserType === 'admin'){
        if(type === "cashier"){
            createCashier(username , email)
        }else{
           flags(undefined , 404 , req , res)
        }
    }else if(req.user.UserType === 'superadmin'){
        if(type === "cashier"){
            createCashier(username, email)
        }else if(type === "admin"){
            createAdmin(username, email)
        }
    }

})

const createAdmin = async (username, email) =>{
    try {
        const newAdmin = {
            username:username, 
            email:email , 
            password:generatePassword(12, false),
            initialSetup:false,
            UserType:"cashier"
        }
        const user = await newAdmin.save()
        return user
    } catch (error) {
        flags(error, undefined , req, res)
    }

}

const createCashier = async (username, email) =>{
    try {
        const newCashier = {
            username:username, 
            email:email , 
            password:generatePassword(12, false),
            initialSetup:false,
            UserType:"cashier"
        }
        const user = await newCashier.save()
        return user
    } catch (error) {
        flags(error, undefined , req, res)
    }
}

module.exports = router