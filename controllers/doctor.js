var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var verifyToken = require('./Authentication');
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
var parseUrlencoded = bodyParser.urlencoded({
  extended: true
});

var doctorModel = require('../models/doctorModel')
var treatmentPlanModel = require('../models/treatmentPlanModel')



router.post('/signUp', parseUrlencoded, async (req, res) => {
  let doctorr = await doctorModel.findOne({
    email: req.body.email
  });
  if (doctorr) {
    return res.status(400).send("user already registered.");
  }
  const { username,
    password,
    location,
    email,
    driefSummery,
    phone,
    title } = req.body

  const newDoctor = new doctorModel({
    _id: mongoose.Types.ObjectId(),
    username,
    password,
    location,// that is contain  City And Region
    email,
    driefSummery,
    phone,
    title
  })

  var salt = await bcrypt.genSalt(10);
  newDoctor.password = await bcrypt.hash(newDoctor.password, salt);
  await newDoctor.save();

  var payload = { subject: newDoctor._id }
  const token = jwt.sign(payload, 'secretKey')
  res.status(200).json({
    token, message: "SignUp Successfully"
  });
})

router.get('/listAll', parseUrlencoded, (req, res) => {// list all Doctors 
  doctorModel.find({}).exec((err, data) => {
    err ? res.json({ message: 'error' }) : res.json({ message: 'success', data })
  })
})

router.post('/account', parseUrlencoded, verifyToken, async (req, res) => {// return data of doctor by ID

  let DData = await doctorModel.findOne({
    _id: req.body.Did
  });

  res.json({ message: 'success', DData })
})

router.post("/patient", parseUrlencoded, (req, res) => {// should donot be here this api 
  const { _id } = req.body.id
  doctorModel.findOne({ _id }).populate('patients').exec((err, data) => {
    patientData = data.patients
    err ? res.json({ message: 'error' }) : res.json({ message: 'success', patientData })

  })
})

router.post('/createTreatmentPlan', (req, res) => { //need to handel req.sesion.user
  const DId = req.userID;
  const {
    treatmentDate,
    cost,
    description,
    patientID,
    accept_flag,

  } = req.body

  doctorModel.findOne({ _id: Did }).exec((err, doctorData) => {
    if (err) {
      res.send("Doctor is not found")
    }
    for (let val of doctorData.treatmentPlans) {
      treatmentPlanModel.findOne({ _id: val }).exec((err, treatment) => {
        if (err) {
          res.send("Treatment Plan is not found")
        }
        if (treatment != null && treatment.patientID == req.body.patientID) {
          treatmentPlanModel.deleteOne({ _id: val }).exec((err) => {
            if (!err) {
              console.log("treatment is deleted")
              doctorModel.updateOne({ _id: Did }, { $pull: { 'treatmentPlans': val } }).exec((err) => {
                if (err) {
                  console.log("error in array")
                }
                console.log("array is deleted")
              })
            }

          })
        }
      })
    }

    let newTreatmentPlan = new treatmentPlanModel({
      _id: mongoose.Types.ObjectId(),
      treatmentDate,
      cost,
      description,
      patientID,
      accept_flag,
      doctorID
    })
    newTreatmentPlan.save((err, data) => {
      if (err) {
        res.send("error in saving function of treatment plan creation")
      }
      doctorData.treatmentPlans.push(data._id)
      doctorData.save((err) => {
        if (err) {
          res.send("error in saving function of push id of treatment plan in doctor data")
        }
        res.json({ message: 'Treatment Plan Added Successfully', treatmentPlan: data })
      })
    })
  })

});

router.post('/addQuestions', parseUrlencoded, (req, res) => {// need to handel req.sesion.user
  const Did = req.userID
  const { Questions } = req.body // "Questions" is object contain all Questions

  doctorModel.findOneAndUpdate({ _id: Did }, { questions: Questions }, (err, data) => {
    if (err) {
      res.send("error in adding question ")
    }
    res.send(data)
  })
});


router.post('/OnOffToggle', parseUrlencoded, (req, res) => {//to identify what if doctor is ON or OFF ---- And need to handel req.sesion.user
  // const _id = req.sesion.user
  const { activeChecked, _id } = req.body

  doctorModel.findOne({ _id }).exec((err, doctorData) => {
    if (err) {
      res.send("error in finding doctor in ONOffToggel API")
    }
    doctorData.activeChecked = activeChecked
    doctorData.save((err, data) => {

      err ? res.json({ message: 'error' }) : res.json({ message: 'success', data })

    })
  })
})




module.exports = router;


// router.post('/sendMessageToPatient', parseUrlencoded, (req, res) => { //Need Editing
//   const { _id, username } = req.session.user
//   const { PId, message } = req.body
//   patientModel.findOne({ _id: PId }).exec((err, Pdata) => {
//     Pdata.doctor_chat.push({ _id, message, username })
//     Pdata.save((err, data) => {

//       err ? resp.json({ message: 'error' }) : resp.json({ message: 'success', data })

//     })
//   })
// })



// router.post('/uploadImage', parseUrlencoded, (req, res) => {  // No Do Any Test For This API

//   token = localStorage.getItem('token')
//   tokenDecoded = parseJwt(token)
//   _id = tokenDecoded._id

//   const { imageURL } = req.body
//   doctorModel.findOne({ _id }).exec((err, DData) => {
//     debugger
//     DData.avatar = imageURL
//     DData.save((err, data) => {
//       err ? res.json({ message: 'error' }) : res.json({ message: 'success', data })

//     })
//   })
// })


