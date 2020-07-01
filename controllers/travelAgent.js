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


var travelAgentModel = require("../models/travelAgent")
var adminModel = require("../models/admin")
var programModel = require("../models/programsModel")
var patientModel = require('../models/patientModel')
var doctorModel = require('../models/doctorModel')



router.post('/signUp', parseUrlencoded, async (req, res) => {


    doctorModel.findOne({ email: req.body.email }).exec((err, doctors) => {
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
                if (doctors || admins || patients) {
                    res.json({ "message": "user already registered" });
                }
                else {


                    travelAgentModel.findOne({ email: req.body.email }).exec((err, agent) => {
                        if (err) {
                            debugger
                            res.json({ "message": "error" })
                        }

                        else if (!agent) {
                            debugger
                            const {
                                companyName,
                                password,
                                email,
                                phone,
                                location
                            } = req.body
                            isApproved = "false"

                            const newTravelAgent = new travelAgentModel({
                                _id: mongoose.Types.ObjectId(),
                                companyName,
                                password,
                                email,
                                phone,
                                location,
                                isApproved,
                            })

                            bcrypt.genSalt(10, function (err, salt) {
                                if (err) {
                                    res.json({ "message": "error" })
                                }
                                bcrypt.hash(req.body.password, salt, function (err, hash) {
                                    if (err) {
                                        res.json({ "message": "error" })
                                    }

                                    newTravelAgent.password = hash
                                    newTravelAgent.save((err) => {
                                        if (err) {
                                            res.json({ "message": "error" })
                                        }
                                        else
                                            res.json({ "message": "success" })
                                    })
                                });
                            });

                        }
                        else {
                            res.json({ "message": "user already registered" });
                        }
                    })

                }
            })
        });
    });
});

router.get('/account', verifyToken, (req, resp) => {
    const travelAgentID = req.userID
    travelAgentModel.findOne({ _id: travelAgentID }).exec((err, data) => {
        err ? resp.json({ message: 'error', err }) : resp.json({ message: 'succes', data })
    })
})

router.post("/AddProgram", verifyToken, (req, res) => {
    const travelAgentID = req.userID
    const {
        title,
        itinerary,
        included,
        excluded,
        catygory,
        cost,
        numberOfDays,
        IMG
    } = req.body
    debugger
    const newProgram = new programModel({
        _id: mongoose.Types.ObjectId(),
        travelAgentID,
        title,
        itinerary,
        included,
        excluded,
        catygory,
        cost,
        numberOfDays,
        IMG
    })
    debugger
    newProgram.save((err, program) => {
        if (err) {
            res.json({ message: "error" })
        }
        travelAgentModel.findOne({ _id: travelAgentID }).exec((err, agent) => {
            if (err) {
                res.json({ message: "error" })
            }
            debugger
            agent.tourismPrograms.push(program._id)
            agent.save()
            console.log("saved in array")
            debugger
            res.json({ message: "success", data: program })

        })
    })

})

router.post("/deleteProgram", verifyToken, (req, res) => {
    const { programID } = req.body
    programModel.remove({ _id: programID }).exec((err) => {
        if (err) {
            res.send(err)
        }
        res.send("program is deleted")
    })
})

router.post('/getprogram', (req, res) => {
    programModel.findOne({ _id: req.body.programID }).exec((err, program) => {
        if (err) {
            res.send(err)
        }

        res.send(program)
    })
})

router.post('/AllPrograms', (req, res) => {
    programModel.find({}).exec((err, programs) => {
        if (err) {
            res.send(err)
        }
        res.send(programs)
    })
})

module.exports = router;

