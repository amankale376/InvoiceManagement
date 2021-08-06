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
            res.send({message:'Information Updated, You can continue further.'})
    } catch (error) {
        flags(error, undefined, req, res)
    }
})

router.post("/createUser/:type", auth, async (req , res)=>{
    const type = ((req.params.type).trim()).toLowerCase()

    if(type === 'superadmin'){
        flags( undefined, 403 , req , res)
    }

    if(req.user.UserType === 'cashier'){
        flags( undefined, 401 , req , res)

    }else if(req.user.UserType === 'admin'){
        if(req.user.initialSetup === false){
            flags({message:"Please update your password before using this feature"}, undefined, req , res)
        }
        if(type === "cashier"){
            createCashier(req.body.username , req.body.email, req ,res)
        }else{
           flags(undefined , 404 , req , res)
        }

    }else if(req.user.UserType === 'superadmin'){

        if(req.user.initialSetup === false){
            flags({message:"Please update your password before using this feature"}, undefined, req , res)
        }
        if(type === "cashier"){
            createCashier(req.body.username , req.body.email, req ,res)
        }else if(type === "admin"){
            createAdmin(req.body.username , req.body.email, req ,res)
        }

    }

})

 router.delete('/deleteUser/:employeeId', auth , async (req , res)=>{
     try {
         const agent = await User.findOne({employeeId:req.params.employeeId})
            !agent ? flags(undefined, 404, req, res): null

         if(req.user.UserType === "admin"){

            if(agent.UserType === "cashier"){
                deleteEmployee(agent.employeeId, req, res)
            }
        }

        if(req.user.UserType === "cashier"){
            flags(undefined, 403 , req , res)
        }

        if(req.user.UserType === "superadmin"){

            if(agent.UserType === "cashier"){
                deleteEmployee(agent.employeeId, req, res)
            }
            if(agent.UserType === "admin"){
                deleteEmployee(agent.employeeId, req, res)
            }
        }

     } catch (error) {
         flags(error, undefined, req, res)
     }
        

 })

 router.get('/logout', auth, async(req,res)=>{
     try{
    req.user.token = ""
        await req.user.save()
        res.send({message:'You are Successfully logged out'})
    } catch (error) {
        flags(error , undefined , req, res)
    }
})

 router.get('/listEmployees' , auth, async (req, res) =>{
     if( req.user.UserType === "cashier"){
        flags(undefined, 403 , req, res)
     }
     try {
     const users = await User.find({},' employeeId , username , email , UserType , -_id ')
     res.send(users)
     } catch (error) {
         flags(error , undefined, req, res)
     }
 })



 const deleteEmployee = async (employeeId, req, res) =>{
    try {
        await User.deleteOne({employeeId:employeeId})
        res.send({message:"User Deleted Successfully"})
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
        res.send({username:username,
            email:email,
            message:'New Admin is created!'}) 
    } catch (error) {
        flags(error, undefined , req, res)
    }

}

const createCashier = async (username, email, req ,res ) =>{
    try {
        const newCashier = new User({
            username:username, 
            email:email , 
            password:generatePassword(12, false),
            initialSetup:false,
            UserType:"cashier"
        })
        const user = await newCashier.save()
       res.send({username:username,
        email:email,
        message:'New Cashier is created!'})
    } catch (error) {
        flags(error, undefined , req, res)
    }
}

module.exports = router