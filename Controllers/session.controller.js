const mongoose = require("mongoose");

const Dean = require("../Models/dean.model");
const Student = require("../Models/student.model");
const moment = require("moment-timezone");

exports.getAllSlots = async (req, res) => {
  const deans = await Dean.find({});
  console.log(deans)
  var modifiedSession = [];
  for (const dean of deans) {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    const daysUntilThursday = (11 - currentDayOfWeek) % 7;
    const nextThursday = new Date(currentDate);
    nextThursday.setDate(currentDate.getDate() + daysUntilThursday);
    nextThursday.setHours(10, 0, 0, 0);
    const slotAvailable = dean.slots;

    const nextFriday = new Date(nextThursday);
    nextFriday.setDate(nextThursday.getDate() + 1);
    const availableSlots =
      slotAvailable &&
      slotAvailable.filter((date) => {
        return date.status == "pending" && date.availability == "available";
      });

    if (availableSlots) {
      modifiedSession.push(
        ...availableSlots.map((data) => {
          return {
            deanName: dean.name,
            deanId: dean.id,
            slot: moment.tz(data.slot, "Asia/Kolkata").format(),
          };
        })
      );
    }

    if (!(await Dean.findOne({
        name:dean.name,
        id: dean.id,
        slots: {
          $elemMatch: {
            slot: nextThursday,
          },
        },
      }))
    ) {
      const bookingSlot = await Dean.findByIdAndUpdate(dean._id, {
        $push: {
          slots: {
            slot: nextThursday,
          },
        },
      });
      modifiedSession.push({
        deanName: dean.name,
        deanId: dean.id,
        slot: nextThursday,
      });
    }

    if (
      !(await Dean.findOne({
        name: dean.name,
        id: dean.id,
        slots: {
          $elemMatch: {
            slot: nextFriday,
          },
        },
      }))
    ) {
      const bookingSlots = await Dean.findByIdAndUpdate(dean._id, {
        $push: {
          slots: {
            status: "pending",
            availability: "available",
            slot: nextFriday,
          },
        },
      });
      modifiedSession.push({
        deanName: dean.name,
        deanId: dean.id,
        slot: nextFriday,
      });
    }
  }

  res.status(200).json({
    availableSession: modifiedSession.length
      ? modifiedSession
      : "no session available",
    success: true,
  });
};

exports.setSlot = async (req, res) => {
  const id = req.body.deanId;
  const name = req.body.deanName;
  const slot = req.body.slot;

  const dean = await Dean.findOne({ id, name });
  if (!dean) {
    return res.status(400).json({ success: false, message: "dean not found" });
  }
  const availableSession = await Dean.findOneAndUpdate(
    {
      name,
      id,
      slots: {
        $elemMatch: {
          status: "pending",
          availability: "available",
          slot: slot,
        },
      },
    },
    {
      $set: {
        "slots.$.availability": "booked",
        "slots.$.student": res.user.id,
      },
    },
    { new: true }
  );

  if (!availableSession) {
    return res
      .status(400)
      .json({ success: false, message: "session is not available" });
  }

  res.status(200).json({ success: true, message: "slot is booked" });
};

exports.getBookedSlot = async (req, res) => {
  const todayDate = new Date();

  const SetPendingSession = await Dean.updateMany(
    { _id: res.user.id, slots: { $elemMatch: { slot: { $lte: todayDate } } } },
    { "slots.$.status": "completed" }
  );

  const pendingSession = await Dean.findById(res.user.id);

  const modifiedSession = [];

  for (const session of pendingSession.slots) {
    if (session.availability == "booked" && session.status == "pending") {
      const avialStudent = await Student.findById(session.student);
      if (avialStudent) {
        const studentName = avialStudent.name;
        const studentId = avialStudent.id;
        modifiedSession.push({
          studentName,
          studentId,
          BookedSlot: session.slot,
        });
      }
    }
  }

  res.status(200).json({
    pendingSession: modifiedSession.length
      ? modifiedSession
      : "No session is booked",
    success: true,
  });
};
