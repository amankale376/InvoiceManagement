require('dotenv').config({path:'../config/.env'})
const mongoose = require('mongoose')
mongoose.connect(process.env.ATLAS,{  useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true })