const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const deanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true , 'please enter your name']
    },
    id: {
        type: String,
        required: [true, 'please enter your id']
    },
    password: {
        type: String,
        required: [true,'please enter a password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            validator: function(val){
                return val== this.password;
            },
            message: 'Password and confirm Password does not match!'
        }  
    },
    slots: {type: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student',default: undefined },
        slot: { type: Date },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        availability: {type: String, enum: ['available', 'booked'], default: 'available'}
    }],default:undefined}
})

deanSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password=await bcrypt.hash(this.password,12);

    this.confirmPassword = undefined;
    next();
})

deanSchema.methods.comparePasswordIndb = async function(pswd,pswddb){
    return await bcrypt.compare(pswd,pswddb);
}

module.exports=mongoose.model('Dean',deanSchema);
