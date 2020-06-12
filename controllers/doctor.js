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
var diagnosisModel = require("../models/diagnosisModel")
var patientModel = require("../models/patientModel")
var adminModel = require("../models/admin")
var travelAgentModel = require("../models/travelAgent")



// function chunk(array, size) {
//   const chunked_arr = [];
//   for (let i = 0; i < array.length; i++) {
//     const last = chunked_arr[chunked_arr.length - 1];
//     if (!last || last.length === size) {
//       chunked_arr.push([array[i]]);
//     } else {
//       last.push(array[i]);
//     }
//   }
//   return chunked_arr;
// }


router.post('/signUp', (req, res) => {


  travelAgentModel.findOne({ email: req.body.email }).exec((err, agents) => {
    if (err) {
      res.json({ "message": "error" })
    }
    adminModel.findOne({ email: req.body.email }).exec((err, admins) => {
      if (err) {
        res.json({ "message": "error" })
      }
      patientModel.findOne({ email: req.body.email }).exec((err, patients) => {
        if (err) {
          res.json({ "message": "error" })
        }
        if (agents || admins || patients) {
          res.json({ "message": "user already registered" });
        }
      })
    })
  })

  doctorModel.findOne({ email: req.body.email }).exec((err, doctor) => {
    if (err) {
      res.json({ "message": "error" })
    }
    else if (!doctor) {
      const {
        username,
        password,
        location,
        email,
        briefSummery,
        phone,
        title,
        Questions } = req.body
      let activeChecked = "true"
      const newDoctor = new doctorModel({
        _id: mongoose.Types.ObjectId(),
        username,
        password,
        location,// that is contain  City And Region
        email,
        briefSummery,
        phone,
        title,
        activeChecked,
        Questions   // "Questions" is array of objects and each object contain all Questions like {"question" : "" , "type":""}
      })
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          res.json({ "message": "error" })
        }
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          if (err) {
            res.json({ "message": "error" })
          }
          newDoctor.password = hash;
          newDoctor.save((err) => {
            if (err) {
              res.json({ "message": "error" })
            }
            const payload = { subject: newDoctor._id }
            const token = jwt.sign(payload, 'secretKey')
            res.json({ "message": "success", data: newDoctor, token, type: 'doctor' })
          });

        });
      });
    }
    else {
      res.json({ "message": "user already registered" });
    }
  })
})

router.get('/listAll', (req, res) => {// list all Doctors 
  doctorModel.find({ activeChecked: "true" }).exec((err, data) => {
    if (err) {
      res.json({ "message": 'error' })
    }

    res.json({ "message": 'success', data })
  })
})

router.post('/account', (req, res) => {// return data of doctor by ID

  doctorModel.findOne({ _id: req.body.Did }).populate({
    path: 'patients', populate: {
      path: 'diagnosisForm',
      model: 'Diagnosis'
    }
  }).exec((err, doctor) => {
    if (err) {
      res.json({ "message": "error" })
    }
    res.json({ "message": 'success', "data": doctor })

  })

})

router.post("/getDiangosisForm", verifyToken, (req, res) => {
  
  diagnosisModel.findOne({ _id: req.body.Did }).exec((err, data) => {
    err ? res.json({ "message": 'error' }) : res.json({ "message": 'success', data: data })

  })
})

router.post('/createTreatmentPlan', verifyToken, (req, res) => { //need to handel req.sesion.user
  const doctorID = req.userID;
  const {
    treatmentDate,
    cost,
    description,
    patientID,

  } = req.body
  debugger
  diagnosisModel.findOne({ patientID: patientID, doctorID: doctorID }).exec((err, alreadySended) => {
    if (err) {
      res.json({ "message": 'error' })
    }
    else if (alreadySended) {

      treatmentPlanModel.findOne({ patientID: patientID, doctorID: doctorID }).exec((err, founded) => {
        if (err) {
          res.json({ "message": 'error' })
        }
        if (founded) {
          treatmentPlanModel.remove({ _id: founded._id }).exec((err) => {
            if (err) {
              res.json({ "message": 'error' })
            }
            doctorModel.updateOne({ _id: doctorID }, { $pull: { 'treatmentPlans': founded._id } }).exec((err) => {
              if (err) {
                res.json({ "message": 'error' })
              }
            })
          })
        }

        let newTreatmentPlan = new treatmentPlanModel({
          _id: mongoose.Types.ObjectId(),
          treatmentDate,
          cost,
          description,
          patientID,
          doctorID
        })
        
        newTreatmentPlan.save((err, result) => {
          debugger
          if (err) {
            res.json({ "message": 'error' })
          }
          doctorModel.findOne({ _id: doctorID }).exec((err, doctor1) => {
            if (err) {
              res.json({ "message": 'error' })
            }
            doctor1.treatmentPlans.push(result._id)
            doctor1.save((err) => {
              if (err) {
                res.json({ "message": 'error' })
              }
              res.json({ "message": 'success', "data": result })
            })


          })

        })

      })

    }
    else if (!alreadySended) {
      res.json({ "message": 'error' })
    }
  })

});

router.post('/addQuestions', (req, res) => {// need to handel req.sesion.user
  // const Did = req.userID
  const { Questions, Did } = req.body // "Questions" is array of objects and each object contain all Questions like {"question" : "" , "type":""}

  doctorModel.findOneAndUpdate({ _id: Did }, { questions: Questions }, (err, data) => {
    if (err) {
      res.json({ "message": 'error' })
    }
    res.json({ "message": 'success', "data": data })
  })
});

router.post('/OnOffToggle', (req, res) => {//to identify what if doctor is ON or OFF ---- And need to handel req.sesion.user
  // const Did = req.userID
  const { activeChecked, Did } = req.body

  doctorModel.findOne({ _id: Did }).exec((err, doctorData) => {
    if (err) {
      res.json({ "message": 'error' })
    }
    doctorData.activeChecked = activeChecked
    doctorData.save((err, data) => {

      err ? res.json({ "message": 'error' }) : res.json({ "message": 'success' })

    })
  })
})




module.exports = router;

