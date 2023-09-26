const express=require('express');
const student = require('../Models/student.model')

const {studentSignUp , studentLogin , deanLogin , deanSignUp,studentProtect} = require('../Controllers/auth.controller')

const router= express.Router();

router.post('/studentSignUp',studentSignUp);
router.post('/studentLogin',studentLogin);
router.post('/deanSignUp',deanSignUp);
router.post('/deanLogin',deanLogin);
router.route('/').get(studentProtect,async(req,res)=>{
    const ap= await student.find({});
    res.json(ap);
});

module.exports= router; 