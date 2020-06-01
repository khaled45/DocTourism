var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var jwt = require('jsonwebtoken');
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var parseUrlencoded = bodyParser.urlencoded({
  extended: true
});

var patientModel = require('../models/patientModel')
var diagnosisModel = require("../models/diagnosisModel")
var treatmentPlanModel = require("../models/treatmentPlanModel")




router.post('/signUp', parseUrlencoded, async (req, res) => {
  const { username, password, email, phone, gender } = req.body
  const newPatient = new patientModel({
    _id: mongoose.Types.ObjectId(),
    username,
    password,
    email,
    phone,
    gender,

  })

  var salt = await bcrypt.genSalt(10);
  newPatient.password = await bcrypt.hash(newPatient.password, salt);
  await newPatient.save();

  const payload = { subject: newPatient._id };
  const token = jwt.sign(payload, 'secretKey')

  res.status(200).json({
    token, message: "SignUp Successfully"
  });
})

router.post("/profileImage", (req, resp) => {// use req.session.user here

  const { _id } = req.session.user

  const { imageURL } = req.body
  patientModel.findOne({ _id }).exec((err, patient) => {

    patient.profileImg = imageURL
    patient.save((err, data) => {
      err ? resp.json({ message: 'error' }) : resp.json({ message: 'success', data })

    })
  })

});

router.post("/fillDiagnosisForm", (req, res) => { // use req.session.user here 
  const Pid = req.userID;
  const {
    doctorID,
    MainProblem,
    avilableDuration,
    Answers
  } = req.body

  diagnosisModel.findOne({ patientID: Pid, doctorID: doctorID }).exec((err, founded) => {
    if (err) {
      res.send("error in finding diagnosis model overwriet")
    }
    else if (founded) {
      diagnosisModel.remove({ _id: founded._id }).exec((err) => {
        console.log("removed from document")
        if (err) {
          res.send(err)
        }
        patientModel.updateOne({ _id: Pid }, { $pull: { 'diagnosisForm': founded._id } }).exec((err) => {
          if (err) {
            console.log("errorin array")
          }
          console.log("deleted from patient array")
        })
      })
    }
    else {
      console.log("not found")
    }

    const newDiagnosisForm = new diagnosisModel({
      _id: mongoose.Types.ObjectId(),
      doctorID,
      patientID,
      MainProblem,
      avilableDuration,
      Answers

    })
    newDiagnosisForm.save((err, result) => {
      if (err) {
        res.sned(err)
      }
      // res.status(200).send("done")
      patientModel.findOne({ _id: Pid }).exec((err, patient) => {
        if (err) {
          res.send(err)
        }
        patient.diagnosisForm.push(result._id)
        patient.save((err, finish) => {
          if (err) {
            res.send(err)
          }
          res.json({ message: 'Diagnosis Form Added Successfully', data: finish })
        })
      })

    })

  });
});

router.post("/Acceptance", (req, res) => {// use req.session.user here
  // let _id = req.sesion.user
  const { accept_flag, treatmentID } = req.body
  treatmentPlanModel.findOne({ _id: treatmentID }).exec((err, treatment) => {
    if (err) {
      res.send("error in finding this treatment Plan ")
    }
    treatment.accept_flag = accept_flag
    treatment.save()
    res.send("done")
  })
})




//    "/patientMedicalMonth" Is Added In Fail Diagnosis API   //////////





module.exports = router;





// function parseJwt(token) {//function to decode jwt Token and return id of current user
//   var base64Url = token.split('.')[1];
//   var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//   var parse = Buffer.from(base64, 'base64').toString()
//   var jsonPayload = decodeURIComponent(parse.split('').map(function (c) {
//     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//   }).join(''));

//   return JSON.parse(jsonPayload);
// };





// router.post("/SigninWithGoogle", (req, resp) => {
//   const { username, email } = req.body
//   patientModel.findOne({ email: email }).exec((err, data) => {
//     if (data) {
//       debugger
//       req.session.user = data
//       resp.json({ message: 'loggedin', data })
//     } else {
//       let p1 = new patientModel({

//         _id: mongoose.Types.ObjectId(),
//         username,
//         email
//       })
//       p1.save((err, data) => {
//         debugger
//         err ? resp.json({ message: 'error', err }) : resp.json({ message: 'success', data })

//       })
//     }

//   })
// });