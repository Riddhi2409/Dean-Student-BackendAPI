const mongoose = require('mongoose');

const Dean = require('../Models/dean.model');
const Student =require('../Models/student.model');
const Session = require('../Models/session.model');
const moment = require('moment-timezone');



exports.getAllSlots = async(req,res) =>{
    const deans = await Dean.find({});
    for (const dean of deans){
        const currentDate = new Date();
        const currentDayOfWeek = currentDate.getDay();
        const daysUntilThursday = (11 - currentDayOfWeek) % 7;
        const nextThursday = new Date(currentDate);
        nextThursday.setDate(currentDate.getDate() + daysUntilThursday);
        nextThursday.setHours(10, 0, 0, 0);
        const deanId = dean._id;
        const currentSession = await Session.findOne({dean: deanId , slot: nextThursday})
        
        if (!currentSession){
          
            const newSession = await Session.create({
                dean: deanId,
                slot: nextThursday,
            });
          
        }

        const nextFriday = new Date(nextThursday);
        nextFriday.setDate(nextThursday.getDate() + 1);
        const FriSession = await Session.findOne({dean: deanId , slot: nextFriday})
        if (!FriSession){
            const newSession = await Session.create({
                dean: deanId,
                slot: nextFriday,
            });
        }
    }

    const allSession = await Session.find({availability: "available"});
        var modifiedSession =[];
    for (const session of allSession){
        const dean = (await Dean.findById(session.dean));
        const dateIndia = moment.tz(session.slot, "Asia/Kolkata").format();
            modifiedSession.push({"DeanName": dean.name, slot: dateIndia, "DeanId":dean.id});
        
    }

   res.status(200).json(modifiedSession)
}

exports.setSlot = async (req,res) => {
    const id = req.body.deanId;
    const name = req.body.deanName;
    const slot = req.body.slot;

    const dean = await Dean.findOne({id,name});
    if (!dean){
        return res.status(400).json({success: false, message: "dean not found"});
    }

    const availableSession = await Session.findOneAndUpdate({dean: dean._id,slot: slot, availability: 'available'},{availability: 'booked', student: res.user.id},{new: true})

    if (!availableSession){
        return res.status(400).json({success: false, message: "session is not available"});
    }

    res.status(200).json({success: true, message: "slot is booked"});
}

exports.getBookedSlot = async (req,res) =>{
    const todayDate= new Date();
    const SetPendingSession = await Session.updateMany({dean: res.user.id,slot: {"$lte": todayDate}},{status: 'completed'})

    const pendingSession = await Session.find({dean: res.user.id , status: 'pending' , availability: 'booked'});

    const modifiedSession = [];

    for (const session of pendingSession){
        const avialStudent = await Student.findById(session.student);
        if (avialStudent){
            const studentName = avialStudent.name;
            const studentId = avialStudent.id;
            modifiedSession.push({
                studentName,
                studentId,
                BookedSlot: session.slot
            })
        }
       
       
        
        
    }

    res.status(200).json({pendingSession: modifiedSession.length ? modifiedSession : "No session is booked",success: true})
}
