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
                            var currentdate = new Date();
                            var createdDate = {
                                "day": currentdate.getDate(),
                                "month": (currentdate.getMonth() + 1),
                                "year": currentdate.getFullYear()
                            }
                            const newTravelAgent = new travelAgentModel({
                                _id: mongoose.Types.ObjectId(),
                                companyName,
                                password,
                                email,
                                phone,
                                location,
                                isApproved,
                                createdDate
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


                                        adminModel.findOne({ email: "khaledkamal9734@gmail.com" }).exec((err, admin) => {
                                            if (err) {
                                                res.json({ "message": "error" })
                                            }
                                            admin.approving.push(newTravelAgent._id)
                                            admin.save((err) => {
                                                if (err) {
                                                    res.json({ "message": "error" })
                                                }

                                                res.json({ "message": "success", data: newTravelAgent })

                                            })

                                        })



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
        })
    })



})

router.post("/AddProgram", (req, res) => {
    const {
        travelAgentID,
        name,
        location,
        cost,
        discription,
        IMG
    } = req.body

    const newProgram = new programModel({
        _id: mongoose.Types.ObjectId(),
        travelAgentID,
        name,
        location,
        cost,
        discription,
        IMG
    })

    newProgram.save((err, program) => {
        if (err) {
            res.send(err)
        }
        travelAgentModel.findOne({ _id: travelAgentID }).exec((err, agent) => {
            if (err) {
                res.send(err)
            }
            agent.tourismPrograms.push(program._id)
            agent.save()
            console.log("saved in array")
            res.send(program)

        })
    })

})

router.post("/deleteProgram", (req, res) => {
    const { programID } = req.body
    programModel.remove({ _id: programID }).exec((err) => {
        if (err) {
            res.send(err)
        }
        res.send("program is deleted")
    })
})

router.get('/program/:id', (req, res) => {
    programModel.findOne({ _id: req.params.id }).exec((err, program) => {
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

