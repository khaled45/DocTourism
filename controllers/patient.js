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
      debugger
      res.json({ "message": "error" })
    }
    adminModel.findOne({ email: req.body.email }).exec((err2, admins) => {
      if (err2) {
        res.json({ "message": "error" })
      }
      travelAgentModel.findOne({ email: req.body.email }).exec((err3, agents) => {
        if (err3) {
          res.json({ "message": "error" })
        }
        if (doctors || admins || agents) {
          debugger
          res.json({ "message": "user already registered" });
        }
        else {

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
              debugger
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
                    res.json({ "message": "success", token, type: 'patient', id: newPatient._id })
                  });

                });
              });
            }
            else {
              debugger
              res.json({ "message": "user already registered" });
            }
          })



        }
      })
    })
  })





});

router.get('/account', verifyToken, (req, res) => {

  patientModel.findOne({ _id: req.userID }).exec((err, patient) => {
    if (err) {
      res.json({ "message": "error" })
    }

    treatmentPlanModel.find({ patientID: req.userID }).populate('doctorID').exec((err, treatmentPlans) => {
      if (err) {
        res.json({ "message": "error" })
      }

      res.json({ "message": 'success', "data": treatmentPlans })
    })
  });
});



router.post("/profileImage", verifyToken, (req, resp) => {// use req.session.user here

  const Pid = req.userID
  const { imageURL } = req.body
  patientModel.findOne({ _id: Pid }).exec((err, patient) => {

    patient.profileImg = imageURL
    patient.save((err, data) => {
      err ? resp.json({ message: 'error' }) : resp.json({ message: 'success', data })

    })
  });

});

router.post("/fillDiagnosisForm", verifyToken, (req, res) => { // use req.session.user here 
  const patientID = req.userID;
  const {
    doctorID,
    MainProblem,
    avilableDuration,
    doctorQuesAns,
    medicalHistory
  } = req.body

  var currentdate = new Date();
  var createdDate = {
    "day": currentdate.getDate(),
    "month": (currentdate.getMonth() + 1),
    "year": currentdate.getFullYear()
  }
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
      createdDate
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

router.post("/Acceptance", verifyToken, (req, res) => {
  const patientID = req.userID
  const { accept_flag, treatmentID } = req.body

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
  // const patientID = req.user.id
  const {
    numberOfAdults,
    numberOfChildren,
    arrivelDate,
    patientID,
    programID
   } = req.body

  programModel.findOne({ _id: programID }).exec((err, program) => {
    if (err) {
      res.json({ "message": "error" })
    }
    program.touristID.push(patientID)
    program.save((err)=>{
      if (err) {
        res.json({ "message": "error" })
      }
      travelAgentModel.findOne({_id:program.travelAgentID}).exec((err,travelAgent)=>{
        travelAgent.patientsID.push(patientID)
        travelAgent.save((err)=>{
          if (err) {
            res.json({ "message": "error" })
          }
          let prog = {"arrivelDate":arrivelDate , "programID" : programID , "numberOfAdults":numberOfAdults , "numberOfChildren" : numberOfChildren}
          patientModel.findOneAndUpdate({_id : patientID} , {program : prog} , (err)=>{
            if (err) {
              res.json({ "message": "error" })
            }
            console.log("user is Enrolled in this program")
            res.json({ "message": "success"})
          })
        })
      })
    })
   })

})

router.post("/feedback", (req, res) => {
  const { patientID, comment, rate, doctorID } = req.body
  let avr = 0
  patientModel.findOne({ _id: patientID }).exec((err, patient) => {
    if (err) {
      res.json({ "message": "error1" })
    }
    doctorModel.findOne({ _id: doctorID }).exec((err, doctor) => {
      if (err) {
        res.json({ "message": "error2" })
      }
      debugger
      let feedback = { "comment": comment, "rate": rate, "data": (new Date()).toLocaleDateString(), "PName": patient.username }
      doctor.feedbacks.push(feedback)
      debugger
      for (let val of doctor.feedbacks) {
        debugger
        avr = avr + parseInt(val.rate)
      }
      totalRate = avr / doctor.feedbacks.length
      debugger
      doctor.rate = totalRate
      debugger
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

