var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
const nodemailer = require('nodemailer');// for send verification mails
var joi = require("joi") //for first level validation
var parseUrlencoded = bodyParser.urlencoded({
  extended: true
});
const bcrypt = require('bcryptjs');//for encode the password
var jwt = require('jsonwebtoken');

var doctorModel = require("../models/doctorModel");

var patientModel = require("../models/patientModel")


router.post('/', parseUrlencoded, async (req, res) => {

  // var {
  //   error
  // } = validate(req.body);
  // debugger
  // if (error) {

  //   return res.status(400).send(error.details[0].message);
  // }
  let patients = await patientModel.findOne({
    email: req.body.email
  });

  let doctors = await doctorModel.findOne({
    email: req.body.email
  });

  if (patients) {

    validepassword = await bcrypt.compare(req.body.password, patients.password);
    if (!validepassword) {
      return res.status(400).send("invalid");

    }
    else {
      let payload = { subject: patients._id }
      let token = jwt.sign(payload, 'secretKey')
      res.status(200).send({ token })
    }


  }

  else if (doctors) {


    validepassword = await bcrypt.compare(req.body.password, doctors.password);
    if (!validepassword) {
      return res.status(400).send("invalid");

    }
    else {
      let payload = { subject: doctors._id }
      let token = jwt.sign(payload, 'secretKey')
      res.status(200).send({ token })
    }
  }

  else {
    res.send("Not Register")
  }

  function validate(req) {
    var schema = {
      email: joi.string().min(5).max(255).required().email(),
      password: joi.string().min(5).max(255).required()
    };
    return joi.validate(req, schema)
  }

})



module.exports = router;
