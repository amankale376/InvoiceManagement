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

            if(req.user.initialSetup === false){
                req.user.initialSetup = true
            }
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
        if(req.user.initialSetup === false){
            flags("Please update your password before using this feature", undefined, req , res)
        }

        if(type === "cashier"){
            createCashier(username , email)
        }else{
           flags(undefined , 404 , req , res)
        }

    }else if(req.user.UserType === 'superadmin'){

        if(req.user.initialSetup === false){
            flags("Please update your password before using this feature", undefined, req , res)
        }
        if(type === "cashier"){
            createCashier(username, email)
        }else if(type === "admin"){
            createAdmin(username, email)
        }

    }

})

 router.post('/deleteUser', auth , async (req , res)=>{
     const {employeeId} = req.body
     try {
         const agent = await User.findOne({employeeId:employeeId})

         if(req.user.UserType === "admin"){

            if(agent.UserType === "cashier"){
                deleteEmployee(employeeId)
            }
        }

        if(req.user.UserType === "cashier"){
            flags("Access denied", undefined , req , res)
        }

        if(req.user.UserType === "superadmin"){

            if(agent.UserType === "cashier"){
                deleteEmployee(employeeId)
            }
            if(agent.UserType === "admin"){
                deleteEmployee(employeeId)
            }
        }

     } catch (error) {
         flags(error, undefined, req, res)
     }
        

 })
 router.get('/listEmployees' , auth, async (req, res) =>{
     if( req.user.UserType === "cashier"){
        flags('access denied', undefined, req, res)
     }
     try {
         
     const users = await User.find({}).select('employeeId', 'username', 'email', 'Usertype')
     res.send(users)
     } catch (error) {
         flags(error , undefined, req, res)
     }
 })



 const deleteEmployee = async (employeeId) =>{
    try {
        await User.findOneAndRemove({employeeId:employeeId})
        res.send("Employee Deleted")
    } catch (error) {
        flags(error, undefined, req, res)
    }
 }

const createAdmin = async (username, email) =>{
    try {
        const newAdmin = new User({
            username:username, 
            email:email , 
            password:generatePassword(12, false),
            initialSetup:false,
            UserType:"cashier"
        })
        const user = await newAdmin.save()
        return user
    } catch (error) {
        flags(error, undefined , req, res)
    }

}

const createCashier = async (username, email) =>{
    try {
        const newCashier = new User({
            username:username, 
            email:email , 
            password:generatePassword(12, false),
            initialSetup:false,
            UserType:"cashier"
        })
        const user = await newCashier.save()
        return user
    } catch (error) {
        flags(error, undefined , req, res)
    }
}

module.exports = router