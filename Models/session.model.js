const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student',default: undefined },
  dean: { type: mongoose.Schema.Types.ObjectId, ref: 'Dean', default: undefined },
  slot: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  availability: {type: String, enum: ['available', 'booked'], default: 'available'}
})

module.exports=mongoose.model('Session',schema);
