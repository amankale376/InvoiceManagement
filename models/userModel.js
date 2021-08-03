require('dotenv').config({path:'../config/.env'})
const flags = require('../config/flag_responses')
const mongoose = require('mongoose')
const Validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true,
        trim:true,
        unique:true,
        lowercase:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        validate(value){
            if(!Validator.isEmail(value)){
                flags("Email format is not correct")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:7,
          validate(value){
              if(value.toLowerCase().includes('password')){
                  flags('Password cannot contain "Password"')
              }
          }
      },
      UserType:{
          type:String,
          require:true,
          trim:true,
          lowercase:true

      },
      token:{
          type:String,
      },
      initialSetup:{
          type:Boolean,
          default:false
      }
    
},
{
    timestamps:true
}
)

userSchema.statics.findByCredentials = async (username, password)=>{
    const user = await User.findOne({username})
    if(!user){
        flags(undefined,401)
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        flags(undefined,401)
    }
    return user
}

userSchema.pre('save', async function (next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
    })

    
userSchema.methods.generateAuthToken = async function(){
    const user = this
     user.token = jwt.sign({_id:user._id.toString()},process.env.USER_SECRET)
    await user.save()
    return user.token
}
const User = mongoose.model('User',userSchema)
module.exports = User