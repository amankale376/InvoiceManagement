require('dotenv').config({path:"./config/.env"})
const express = require('express')
const mongoose = require('mongoose')
const router = require('./routes/userRoutes')
const invoiceRouter = require('./routes/invoiceRoutes')
const InitialAdmin = require('./config/initialAdmin')
require('./db/db_connect')
 const logger = require('./logger/index')
const PORT = 3000 || process.env.PORT
const app = express()
app.set('view engine','ejs')
app.use(express.json())
app.use(router)
app.use(invoiceRouter)
InitialAdmin()
app.listen(PORT,()=>console.log("server is up at "+PORT))

// logger.log({
//     level: 'info',
//     message: 'Hello distributed log files!'
//   });
//   logger.error({
//     level:'error',
//     message:'this is error message'
//   });