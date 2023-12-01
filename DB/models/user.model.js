import mongoose from 'mongoose';
import { systemRoles } from '../../src/utils/systemRoles.js';
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        lowercase:true,
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:[ systemRoles.USER , systemRoles.ADMIN],
        default: systemRoles.USER
    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    token:String
},{
    timestamps:true
})

// hook for hashing the password before saving
userSchema.pre('save', function(next){
    this.password = bcrypt.hashSync(this.password, +process.env.HASH_SALT_ROUNDS )
    next()
 })


export const userModel = mongoose.model('User',userSchema)