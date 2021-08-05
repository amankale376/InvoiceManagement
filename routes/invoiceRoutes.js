const express = require('express')
const invoiceRouter = express.Router()
const Invoice = require('../models/invoiceModel')
const auth = require('../middleware/Auth')
const User = require('../models/userModel')
const flags = require('../config/flag_responses')
const pdf = require('html-pdf')
const options = {format:'A4'}
const fs = require('fs')
const sendPdfEmail = require('../helper/email')
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
             res.render('invoice', {data:invoice}, function(err , html){
                 pdf.create(html, options).toBuffer( async function(err, buffer){
                    if(err){
                        return flags(err , undefined , req, res)
                    }else{
                        let buff = await buffer.toString('base64')
                        sendPdfEmail(buff ,invoice.email)
                        
                    }
                })
            })
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