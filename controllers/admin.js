var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var verifyToken = require('./Authentication')
var parseUrlencoded = bodyParser.urlencoded({
    extended: true
});
const nodemailer = require('nodemailer'); // for send verification mails


var adminModel = require("../models/admin")
var travelAgentModel = require("../models/travelAgent")
var doctorModel = require("../models/doctorModel")
var patientModel = require("../models/patientModel")

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'DocTourism.com@gmail.com',
        pass: '123Khaled@'
    }
});

router.post('/signUp', parseUrlencoded, async(req, res) => {


        travelAgentModel.findOne({ email: req.body.email }).exec((err, agents) => {
            if (err) {
                res.json({ "message": "error" })
            }
            doctorModel.findOne({ email: req.body.email }).exec((err, doctors) => {
                if (err) {
                    res.json({ "message": "error" })
                }
                patientModel.findOne({ email: req.body.email }).exec((err, patients) => {
                    if (err) {
                        res.json({ "message": "error" })
                    }
                    if (agents || doctors || patients) {
                        res.json({ "message": "user already registered" });
                    } else {

                        adminModel.findOne({ email: req.body.email }).exec((err, admin) => {
                            if (err) {
                                res.json({ "message": "error" })
                            } else if (!admin) {
                                const {
                                    username,
                                    password,
                                    email,
                                    phone
                                } = req.body

                                const newAdmin = new adminModel({
                                    _id: mongoose.Types.ObjectId(),
                                    username,
                                    password,
                                    email,
                                    phone
                                })

                                bcrypt.genSalt(10, function(err, salt) {
                                    if (err) {
                                        res.json({ "message": "error" })
                                    }
                                    bcrypt.hash(req.body.password, salt, function(err, hash) {
                                        if (err) {
                                            res.json({ "message": "error" })
                                        }
                                        newAdmin.password = hash;
                                        newAdmin.save((err) => {
                                            if (err) {
                                                res.json({ "message": "error" })
                                            }
                                            res.json({ "message": "success", data: newAdmin })
                                        });

                                    });
                                });
                            } else {
                                res.json({ "message": "user already registered" })
                            }
                        })

                    }
                })
            })
        })





    })
    // admin approve doctors and travel agents requests 
router.post("/Approving", (req, res) => {
    const { ID, approveFlag } = req.body
    travelAgentModel.findOne({ _id: ID }).exec((err, agent) => {
        if (err) {
            res.json({ "message": "error" })
        }
        if (!agent) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////    

            doctorModel.findOne({ _id: ID }).exec((err, doctor) => {
                if (err) {
                    res.json({ "message": "error" })
                }
                if (!doctor) {
                    res.json({ "message": "user not register" })
                }
                if (doctor) {

                    if (approveFlag == "false") {
                        let mailOptions = {
                            from: 'DocTourism.com@gmail.com',
                            to: doctor.email,
                            subject: 'This E-mail is from DocTourism website',
                            html: `
                        <!doctype html>
                        <html lang="en-US">
                        
                        <head>
                            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                            <title>Reset Password Email Template</title>
                            <meta name="description" content="Reset Password Email Template.">
                            <style type="text/css">
                                a:hover {text-decoration: underline !important;}
                            </style>
                        </head>
                        
                        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                            <!--100% body table-->
                            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                                <tr>
                                    <td>
                                        <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                            align="center" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="height:80px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="text-align:center;">
                                                  <a href="https://rakeshmandal.com" title="logo" target="_blank">
                                                    <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo">
                                                  </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:20px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                        <tr>
                                                            <td style="height:40px;">&nbsp;</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:0 35px;">
                                                                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have Rejection for your Account</h1>
                                                                <span
                                                                    style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                                I'm sorry to let you know your account was rejected and I wish you the best of luck in coming. Thank you very much!
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="height:40px;">&nbsp;</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            <tr>
                                                <td style="height:20px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="text-align:center;">
                                                    <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.Doctourism.com</strong></p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:80px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <!--/100% body table-->
                        </body>
                        
                        </html>`

                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                res.json({ "message": "error" })
                            }
                            doctorModel.remove({ _id: ID }).exec((err) => {
                                if (err) {
                                    res.json({ "message": "error" })
                                }
                                res.json({ "message": "success" })

                            })
                        });

                    } else if (approveFlag == "true") {
                        doctor.isApproved = approveFlag
                        doctor.save((err) => {
                            if (err) {
                                res.json({ "message": "error" })
                            }
                            // send Mail to Travel Agent Accepted HERE
                            let mailOptions = {
                                from: 'DocTourism.com@gmail.com',
                                to: doctor.email,
                                subject: 'This E-mail is from DocTourism website',
                                html: `
                            <!doctype html>
                            <html lang="en-US">
                            
                            <head>
                                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                                <title>Reset Password Email Template</title>
                                <meta name="description" content="Reset Password Email Template.">
                                <style type="text/css">
                                    a:hover {text-decoration: underline !important;}
                                </style>
                            </head>
                            
                            <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                                <!--100% body table-->
                                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                                    <tr>
                                        <td>
                                            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                                align="center" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="height:80px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align:center;">
                                                      <a href="https://rakeshmandal.com" title="logo" target="_blank">
                                                        <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo">
                                                      </a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:20px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                            <tr>
                                                                <td style="height:40px;">&nbsp;</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:0 35px;">
                                                                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have Acceptance for your Account</h1>
                                                                    <span
                                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                                        You Have Access to Login in Your Account.
                                                                    </p>
                                                                    <a href="http://localhost:4200/login"
                                                                        style="background:#068eff;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Login</a>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="height:40px;">&nbsp;</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                <tr>
                                                    <td style="height:20px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align:center;">
                                                        <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.Doctourism.com</strong></p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:80px;">&nbsp;</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <!--/100% body table-->
                            </body>
                            
                            </html>`

                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    res.json({ "message": "error" })
                                }
                                res.json({ "message": "success" })
                            });
                        })
                    } else {
                        res.json({ "message": "error" })
                    }
                }

            })

            /////////////////////////////////////////////////////////////////////////////////////////////////////
        }
        if (agent) {
            if (approveFlag == "false") {
                let mailOptions = {
                    from: 'DocTourism.com@gmail.com',
                    to: agent.email,
                    subject: 'This E-mail is from DocTourism website',
                    html: `
                    <!doctype html>
                    <html lang="en-US">                    
                    <head>
                        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                        <title>Reset Password Email Template</title>
                        <meta name="description" content="Reset Password Email Template.">
                        <style type="text/css">
                            a:hover {text-decoration: underline !important;}
                        </style>
                    </head>
                    
                    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                        <!--100% body table-->
                        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                            <tr>
                                <td>
                                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                        align="center" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="height:80px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:center;">
                                              <a href="https://rakeshmandal.com" title="logo" target="_blank">
                                                <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo">
                                              </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="height:20px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                    <tr>
                                                        <td style="height:40px;">&nbsp;</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding:0 35px;">
                                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have Rejection for your Account</h1>
                                                            <span
                                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                            I'm sorry to let you know your account was rejected and I wish you the best of luck in coming. Thank you very much!
                                                            </p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="height:40px;">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        <tr>
                                            <td style="height:20px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:center;">
                                                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.Doctourism.com</strong></p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="height:80px;">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <!--/100% body table-->
                    </body>
                    
                    </html>`

                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.json({ "message": "error" })
                    }
                    res.json({ "message": "success" })
                });

                travelAgentModel.delete({ _id: ID }).exec((err) => {
                    if (err) {
                        res.json({ "message": "error" })
                    }
                });
            } else if (approveFlag == "true") {
                agent.isApproved = approveFlag
                agent.save((err) => {
                    if (err) {
                        res.json({ "message": "error" })
                    }
                    // send Mail to Travel Agent Accepted HERE
                    let mailOptions = {
                        from: 'DocTourism.com@gmail.com',
                        to: agent.email,
                        subject: 'This E-mail is from DocTourism website',
                        html: `
                        <!doctype html>
                        <html lang="en-US">
                        
                        <head>
                            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                            <title>Reset Password Email Template</title>
                            <meta name="description" content="Reset Password Email Template.">
                            <style type="text/css">
                                a:hover {text-decoration: underline !important;}
                            </style>
                        </head>
                        
                        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                            <!--100% body table-->
                            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                                <tr>
                                    <td>
                                        <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                            align="center" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="height:80px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="text-align:center;">
                                                  <a href="https://rakeshmandal.com" title="logo" target="_blank">
                                                    <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo">
                                                  </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:20px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                        style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                        <tr>
                                                            <td style="height:40px;">&nbsp;</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:0 35px;">
                                                                <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have Acceptance for your Account</h1>
                                                                <span
                                                                    style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                                <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                                    You Have Access to Login in Your Account.
                                                                </p>
                                                                <a href="http://localhost:4200/login"
                                                                    style="background:#068eff;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Login</a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="height:40px;">&nbsp;</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            <tr>
                                                <td style="height:20px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="text-align:center;">
                                                    <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.Doctourism.com</strong></p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:80px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <!--/100% body table-->
                        </body>
                        
                        </html>`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            res.json({ "message": "error" })
                        }
                        res.json({ "message": "success" })
                    });
                })
            } else {
                res.json({ "message": "error" })
            }
        }

    })


})

// admin remove agents form system

router.post("/deletTravelAgent", (req, res) => { //need testing
    const { TravelAgentID } = req.body
    travelAgentModel.remove({ _id: TravelAgentID }).exec((err) => {
        if (err) {
            res.json({ "message": "error" })
        }
        res.json({ "message": "success" })
    })
})

// admin remove doctors form system

router.post("/deletDoctor", (req, res) => { //need testing
    const { doctorID } = req.body
    doctorModel.remove({ _id: doctorID }).exec((err) => {
        if (err) {
            res.json({ "message": "error" })
        }
        res.json({ "message": "success" })
    });

})

router.get('/listDcotorsAndAgents', verifyToken, (req, res) => {
    doctorModel.find({}).exec((err, doctors) => {
        if (err) {
            res.json({ "message": "error" })
        }
        travelAgentModel.find({}).exec((err, agents) => {
            if (err) {
                res.json({ "message": "error" })
            }
            res.json({ "message": "success", "data": { "doctors": doctors, "travelAgents": agents } })
        })
    })
})



module.exports = router;