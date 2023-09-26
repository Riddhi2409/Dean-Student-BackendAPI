const express = require('express');

const router = express.Router();

const {studentProtect, deanProtect} = require('../Controllers/auth.controller');
const {getAllSlots,setSlot,getBookedSlot}=require('../Controllers/session.controller');

router.route('/getAllSlots').get(studentProtect,getAllSlots);
router.route('/setSlot').post(studentProtect,setSlot);
router.route('/bookedSession').get(deanProtect,getBookedSlot)

module.exports = router;