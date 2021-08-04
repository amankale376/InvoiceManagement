const express = require('express')
const invoiceRouter = express.Router()
const Invoice = require('../models/invoiceModel')
const auth = require('../middleware/Auth')
const User = require('../models/userModel')
const flags = require('../config/flag_responses')

invoiceRouter.post("/generateInvoice", auth, async (req, res) =>{
    const {name,items, email} = req.body
    let totalTax = 0
    let totalAmount = 0
    items.forEach(element => {
        totalAmount = totalAmount + (element.price * element.quantity)
       totalTax = totalTax + ((element.price * element.quantity) / 100)*12
    })
   
    try {
        const newInvoice = new Invoice({
            name:name,
            email:email,
            items:items,
            cashier:req.user.employeeId,
            tax:totalTax,
            totalAmount:totalAmount,
            
        })
        const invoice = await newInvoice.save()
        res.send(invoice)
    } catch (error) {
        flags(error, undefined , req, res)
    }
})

invoiceRouter.get("/sendEmail/:invoiceNumber", auth, async (req, res)=>{

})

invoiceRouter.get("/listRevenue" , auth , async (req , res)=>{

try {
    

} catch (error) {
 
    
}

})

invoiceRouter.get('/listInvoices', auth, async (req, res) =>{

    if(req.user.UserType === 'cashier'){
        try {
            const invoices =  await Invoice.find({employeeId:req.user.employeeId}).sort({createdAt:req.query.sortBy})
            res.send(invoices)
        } catch (error) {
            flags(error, undefined, req, res)
        }
    }

    if(req.user.UserType === "admin" || req.user.UserType === "superadmin"){
        try {
            const invoices =  await Invoice.find({}).sort({createdAt:req.query.sortBy})
            res.send(invoices)
        } catch (error) {
            flags(error, undefined, req, res)
        }
  
    }

})


invoiceRouter.get('/invoice/:invoiceId' , auth , async (req, res)=>{
   try {

    if(req.user.UserType === "cashier")
    {
        const invoice = invoiceFind(req.params.invoiceId)
    if(req.user.employeeId === invoice.cashier){
        res.send(invoice)
    }else{
        flags(undefined,403, req, res)
    }

    }

    if(req.user.UserType === 'admin' || req.user.UserType === 'superadmin'){
        const invoice = invoiceFind(req.params.invoiceId)
        res.send(invoice)
    }
    
   } catch (error) {
       flags(error, undefined, req, res)
   } 

})

const invoiceFind = async (invoiceId) =>{
    return await Invoice.findOne({invoiceId:invoiceId}) 
}

module.exports = invoiceRouter