var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var jwt = require('jsonwebtoken');
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var parseUrlencoded = bodyParser.urlencoded({
  extended: true
});
var verifyToken = require('./Authentication');

var doctorModel = require('../models/doctorModel')
var patientModel = require('../models/patientModel')
var diagnosisModel = require("../models/diagnosisModel")
var treatmentPlanModel = require("../models/treatmentPlanModel")
var programModel = require("../models/programsModel")
var travelAgentModel = require("../models/travelAgent")
var adminModel = require("../models/admin")


function chunk(array, size) {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i++) {
    const last = chunked_arr[chunked_arr.length - 1];
    if (!last || last.length === size) {
      chunked_arr.push([array[i]]);
    } else {
      last.push(array[i]);
    }
  }
  return chunked_arr;
}

router.post('/signUp', (req, res) => {


  doctorModel.findOne({ email: req.body.email }).exec((err, doctors) => {
    if (err) {
      res.json({ "message": "error" })
    }
    adminModel.findOne({ email: req.body.email }).exec((err, admins) => {
      if (err) {
        res.json({ "message": "error" })
      }
      travelAgentModel.findOne({ email: req.body.email }).exec((err, agents) => {
        if (err) {
          res.json({ "message": "error" })
        }
        if (doctors || admins || agents) {
          res.json({ "message": "user already registered" });
        }
      })
    })
  })



  patientModel.findOne({ email: req.body.email }).exec((err, patient) => {
    if (err) {
      res.json({ "message": "error" })
    }
    else if (!patient) {
      const {
        username,
        password,
        email,
        phone,
        gender,
        age } = req.body

      const newPatient = new patientModel({
        _id: mongoose.Types.ObjectId(),
        username,
        password,
        email,
        phone,
        gender,
        age
      })
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          res.json({ "message": "error" })
        }
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          if (err) {
            res.json({ "message": "error" })
          }
          newPatient.password = hash;
          newPatient.save((err) => {
            if (err) {
              res.json({ "message": "error" })
            }
            const payload = { subject: newPatient._id }
            const token = jwt.sign(payload, 'secretKey')
            res.json({ "message": "success", token,type: 'patient' })
          });

        });
      });
    }
    else {
      res.json({ "message": "user already registered" });
    }
  })

})

router.post("/profileImage", verifyToken, (req, resp) => {// use req.session.user here

  const Pid = req.userID
  const { imageURL } = req.body
  patientModel.findOne({ _id: Pid }).exec((err, patient) => {

    patient.profileImg = imageURL
    patient.save((err, data) => {
      err ? resp.json({ message: 'error' }) : resp.json({ message: 'success', data })

    })
  })

});

router.post("/fillDiagnosisForm", verifyToken,(req, res) => { // use req.session.user here 
  const patientID = req.userID;
  const {
    doctorID,
    MainProblem,
    avilableDuration,
    doctorQuesAns,
    medicalHistory
  } = req.body

  diagnosisModel.findOne({ patientID: patientID, doctorID: doctorID }).exec((err, founded) => {
    if (err) {
      res.json({ "message": "error" })
    }
    else if (founded) {
      diagnosisModel.remove({ _id: founded._id }).exec((err) => {
        if (err) {
          res.json({ "message": "error" })
        }
        patientModel.updateOne({ _id: patientID }, { $pull: { 'diagnosisForm': founded._id } }).exec((err) => {
          if (err) {
            res.json({ "message": "error" })
          }
        })
      })
    }


    const newDiagnosisForm = new diagnosisModel({
      _id: mongoose.Types.ObjectId(),
      doctorID,
      patientID,
      MainProblem,
      avilableDuration,
      doctorQuesAns,
      medicalHistory,
      Date:Date.now()
    })
    debugger
    newDiagnosisForm.save((err, result) => {
      if (err) {
        res.json({ "message": "error" })
      }
      // res.status(200).send("done")
      patientModel.findOne({ _id: patientID }).exec((err, patient) => {
        if (err) {
          res.json({ "message": "error" })
        }
        patient.diagnosisForm.push(result._id)
        patient.save((err, finish) => {
          if (err) {
            res.json({ "message": "error" })
          }
          doctorModel.findOne({ _id: req.body.doctorID }).exec((err, doctor) => {
            if (err) {
              res.json({ "message": "error" })
            }
            doctor.patients.push(patientID)
            doctor.save((err) => {
              if (err) {
                res.json({ "message": "error" })
              }
              res.json({ "message": 'success', "data": newDiagnosisForm })

            })

          })
        })
      })

    })

  });
});

router.post("/Acceptance", (req, res) => {// use req.session.user here
  // const patientID = req.userID
  const { accept_flag, treatmentID, patientID } = req.body

  treatmentPlanModel.findOne({ _id: treatmentID, patientID: patientID }).exec((err, treatment) => {
    if (err) {
      res.json({ "message": "error" })
    }
    else if (treatment) {
      if (accept_flag == "true") {
        treatment.accept_flag = accept_flag
        treatment.save((err) => {
          if (err) {
            res.json({ "message": "error" })
          }
          res.json({ "message": "success" })
        })
      }
      else if (accept_flag == "false") {
        treatmentPlanModel.remove({ _id: treatmentID }).exec((err) => {
          if (err) {
            res.json({ "message": "error" })
          }
          doctorModel.updateOne({ _id: treatment.doctorID }, { $pull: { 'treatmentPlans': treatmentID } }).exec((err) => {
            if (err) {
              res.json({ "message": "error" })
            }
            doctorModel.updateOne({ _id: treatment.doctorID }, { $pull: { 'patients': treatment.patientID } }).exec((err) => {
              if (err) {
                res.json({ "message": "error" })
              }
            })
          })

        })
        diagnosisModel.findOne({ doctorID: treatment.doctorID, patientID: patientID }).exec((err, diagnosis) => {
          if (err) {
            res.json({ "message": "error" })
          }
          diagnosisModel.remove({ _id: diagnosis._id }).exec((err) => {
            if (err) {
              res.json({ "message": "error" })
            }
            else { console.log("diagnosis removed from document") }
          })

          patientModel.updateOne({ _id: patientID }, { $pull: { 'diagnosisForm': diagnosis._id } }).exec((err) => {
            if (err) {
              res.json({ "message": "error" })
            }
            res.json({ "message": "success" })
          })


        })

      }
      else { res.json({ "message": "error" }) }
    }
    else if (!treatment) {
      res.json({ "message": "error" })
    }
    else {
      res.json({ "message": "error" })
    }


  })
})

//test needed
router.get('/program/:id', (req, res) => {
  programModel.findOne({ _id: req.params.id }).exec((err, program) => {
    if (err) {
      res.json({ "message": "error" })
    }

    res.json({ "message": "success", "data": program })
  })
})

//test needed
router.post('/ProgramsByArea', (req, res) => {//return array of programs spliting to arrays and each array load 12 program
  const { doctorID } = req.body
  doctorData = doctorModel.findOne({ _id: doctorID })
  finding = { "city": doctorData.location.city, "area": doctorData.location.area }
  programModel.find({ location: finding }).exec((err, programs) => {
    if (err) {
      res.json({ "message": "error" })
    }
    chunks = chunk(programs, 12)
    res.json({ "message": "success", "data": chunks })
  })
})

//test needed
router.post('/enrollProgram', (req, res) => {
  const { patientID, programID } = req.body

  programModel.findOne({ _id: programID }).exec((err, program) => {
    if (err) {
      res.json({ "message": "error" })
    }
    travelAgentModel.findOne({ _id: program.travelAgentID }).exec((err, agent) => {
      if (err) {
        res.json({ "message": "error" })
      }
      agent.patientsID.push(patientID)
      agent.save((err) => {
        if (err) {
          res.json({ "message": "error" })
        }
        console.log("saved patient id in array in travel agent model")

        patientModel.findOneAndUpdate({ _id: patientID }, { programID: programID }).exec((err) => {
          if (err) {
            res.json({ "message": "error" })
          }
          console.log("put program id in patient data")
          res.json({ "message": "success" })
        })
      })
    })
  })

})

router.post("/feedback", (req, res) => {
  const { patientID, comment, rate, doctorID } = req.body
  var datetime = new Date();
  patientModel.findOne({ _id: patientID }).exec((err, patient) => {
    if (err) {
      res.json({ "message": "error1" })
    }
    doctorModel.findOne({ _id: doctorID }).exec((err, doctor) => {
      if (err) {
        res.json({ "message": "error2" })
      }
      let feedback = { "comment": comment, "rate": rate, "data": datetime, "PName": patient.name }
      doctor.feedbacks.push(feedback)

      doctor.save((err) => {
        if (err) {
          res.json({ "message": "error3" })
        }
        res.json({ "message": "success" })
      })
    })
  })
})


module.exports = router;

