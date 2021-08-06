const express = require('express')
const invoiceRouter = express.Router()
const Invoice = require('../models/invoiceModel')
const auth = require('../middleware/Auth')
const flags = require('../config/flag_responses')
const {sendMailPdf} = require('../email')
const moment = require('moment')


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



invoiceRouter.get("/sendEmail/:invoiceId", auth, async (req, res)=>{
        try {
            const invoice =  await Invoice.findOne({invoiceId:req.params.invoiceId})
            if(!invoice){
                flags(undefined, 404 , req, res)
            }
            sendMailPdf(res , invoice)
            invoice.emailSent = true
            await invoice.save()
        } catch (error) {
            flags(error , undefined , req, res)
        }
  

})


invoiceRouter.get("/listRevenue" , auth , async (req , res)=>{
try {
    const filter = req.query.filter
    switch(filter)
    {
        case 'day':{
            const invoices = await Invoice.find({"createdAt":{"$gte":moment().startOf('day'), "$lte":moment().endOf('day')}} , ' tax , createdAt , totalAmount ')
            invoicesIterate(invoices, res)
            break
        }
        case 'yesterday':{
            const invoices = await Invoice.find({"createdAt":{"$gte":moment().subtract(1, 'days').calendar(), "$lte":moment().startOf('day')}} , ' tax , createdAt , totalAmount ')
            invoicesIterate(invoices, res)
            break
        }
        case 'week':{
            const invoices = await Invoice.find({"createdAt":{"$gte":moment().subtract(6, 'days').calendar(), "$lte":moment().endOf('day')}} , ' tax , createdAt , totalAmount ')
            invoicesIterate(invoices, res)
            break 
        }
        case 'month':{
            const invoices = await Invoice.find({"createdAt":{"$gte":moment().subtract(30, 'days').calendar()}} , ' tax , createdAt , totalAmount ')
            invoicesIterate(invoices, res)
            break
        }
        default:{
            const invoices = await Invoice.find({} , ' tax , createdAt , totalAmount ')  
            invoicesIterate(invoices, res)
        }
    
    }
} catch (error) {
 
    flags(error, undefined , req, res)
}
})

const invoicesIterate = (invoices, res)=>{
    let totalAmount = 0
    let totalTax = 0
    invoices.forEach(e => {
        totalTax = totalTax + parseFloat(e.tax)
        totalAmount = totalAmount +parseFloat(e.totalAmount)

        res.send({
            totalAmount: totalAmount,
            totalTax: totalTax
        })
})
}


invoiceRouter.delete('/deleteInvoice/:id', auth , async (req , res)=>{
    try {
        if(req.user.UserType === 'cashier'){
            flags(undefined, 403, req , res)
        }
        await Invoice.deleteOne({invoiceId:req.params.id})
        res.send({message:"Invoice with "+req.params.id+" id deleted Successfully"})
    } catch (error) {
        flags(error, undefined , req , res)
    }
})

invoiceRouter.get('/listInvoices', auth, async (req, res) =>{

    if(req.user.UserType === 'cashier'){
        try {
            const invoices =  await Invoice.find({cashier:req.user.employeeId}).sort({createdAt:req.query.sortBy})
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
        const invoice = await Invoice.findOne({invoiceId:req.params.invoiceId}) 
    if(req.user.employeeId === invoice.cashier){
        res.send(invoice)
    }else{
        flags(undefined,403, req, res)
    }

    }

    if(req.user.UserType === 'admin' || req.user.UserType === 'superadmin'){
        const invoice = await Invoice.findOne({invoiceId:req.params.invoiceId}) 
        console.log(invoice)
        res.send(invoice)
    }
    
   } catch (error) {
       flags(error, undefined, req, res)
   } 

})


module.exports = invoiceRouter