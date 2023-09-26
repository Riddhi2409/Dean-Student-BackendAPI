const util= require('util')
require('dotenv').config();

const student = require("../Models/student.model");
const dean = require("../Models/dean.model");

const jwt = require("jsonwebtoken");
const { decode } = require('punycode');
require("dotenv").config;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_TOKEN);
};

exports.studentSignUp = async (req, res) => {
  const { name, id, password, confirmPassword } = req.body;

  if (await student.findOne({ id })) {
    return res.status(400).json({ success: false, error: "user already exist" });
  } 
    try {
      const newStudent = await student.create({
        name,
        id,
        password,
        confirmPassword,
      });
      const token = signToken(newStudent._id);
      return res.status(200).json({ token: token, success: true });
    } catch (err) {
      return res.status(500).json({ success: false });
    }
  
};

exports.studentLogin = async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    res.status(400).json({ error: "enter both id and password" });
  } else {
    const currentStudent = await student.findOne({ id }).select("+password");
    if (
      !currentStudent ||
      !(await currentStudent.comparePasswordIndb(
        password,
        currentStudent.password
      ))
    ) {
      res.status(400).json({ error: "enter valid id and password" });
    } else {
      const token = signToken(currentStudent._id);
      res.status(200).json({ token: token, success: true });
    }
  }
};

exports.deanSignUp = async (req, res) => {
  const { name, id, password, confirmPassword } = req.body;

  if (await dean.findOne({ id })) {
    res
      .status(400)
      .json({ success: false, errorMessage: "user already exist" });
  } else {
    try {
      const newDean = await dean.create(req.body);
      const token = signToken(newDean._id);
      res.status(200).json({ token: token, success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  }
};

exports.deanLogin = async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    res.status(400).json({ error: "enter both id and password" });
  } else {
    const currentDean = await dean.findOne({ id }).select("+password");
    if (
      !currentDean ||
      !(await currentDean.comparePasswordIndb(password, currentDean.password))
    ) {
      res.status(400).json({ error: "enter valid id and password" });
    } else {
      const token = signToken(currentDean._id);
      res.status(200).json({ token: token, success: true });
    }
  }
};

exports.studentProtect = async(req,res,next) => {
    const testToken = req.headers.authorization;

    var token;
    if (testToken && testToken.startsWith('bearer')){
      token=testToken.split(' ')[1];
    }
    if (!token){
      res.status(401).json({error: "User is ot logged in"})
    }
    jwt.verify(token,process.env.SECRET_TOKEN,async function(err,decoded){
      if (err){
        return res.status(500).send({ auth: false, message: err }); 
      }
      if (!(await student.findById(decoded.id))){
        return res.status(500).send({ auth: false, message: "user not exixts" })
      }
      
      res.user= decoded;
      next();
    })

}

exports.deanProtect =  async(req,res,next) => {
  const testToken = req.headers.authorization;

    var token;
    if (testToken && testToken.startsWith('bearer')){
      token=testToken.split(' ')[1];
    }
    if (!token){
      res.status(401).json({error: "User is ot logged in"})
    }
    jwt.verify(token,process.env.SECRET_TOKEN,async function(err,decoded){
      if (err){
        return res.status(500).send({ auth: false, message: err }); 
      }
      if (!(await dean.findById(decoded.id))){
        return res.status(500).send({ auth: false, message: "user not exixts" })
      }
      res.user= decoded;
      next();
    })

}
