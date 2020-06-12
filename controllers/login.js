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
var emailhtml = require("../")

var doctorModel = require("../models/doctorModel");
var patientModel = require("../models/patientModel")
var adminModel = require("../models/admin")
var travelAgentModel = require("../models/travelAgent")



// function validate(req) {
//   var schema = {
//     email: joi.string().min(8).max(255).required().email(),
//     password: joi.string().min(8).max(255).required()
//   };
//   return joi.validate(req, schema)
// }


router.post('/', parseUrlencoded, async (req, res) => {

  // var {
  //   error
  // } = validate(req.body);

  // if (error) {

  //   return res.status(400).json({ "message": "error" });  
  // }

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
        doctorModel.findOne({ email: req.body.email }).exec((err, doctors) => {
          if (err) {
            res.json({ "message": "error" })
          }
          if (agents || admins || patients || doctors) {


            if (patients) {

              bcrypt.compare(req.body.password, patients.password, (err, validepassword) => {
                if (err) {
                  res.json({ "message": "error" })
                }
                else if (!validepassword) {
                  res.status(400).json({ "message": "invalid email or passwod" })
                }
                else {
                  let payload = { subject: patients._id }
                  let token = jwt.sign(payload, 'secretKey')
                  res.status(200).json({ "message": "success", "token": token, type: 'patient', id: patients._id })
                }

              });
            }

            else if (doctors) {
              if (doctors.isApproved == "true") {
                bcrypt.compare(req.body.password, doctors.password, (err, validepassword) => {
                  if (err) {
                    res.json({ "message": "error" })
                  }
                  else if (!validepassword) {
                    res.status(400).json({ "message": "invalid email or passwod" })
                  }
                  else {
                    let payload = { subject: doctors._id }
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).json({ "message": "success", "token": token, type: 'doctor', id: doctors._id })
                  }

                });
              }
              else if (doctors.isApproved == "false") {

                res.status(400).json({ "message": "not approved" })
              }
              else {
                res.json({ "message": "error" })
              }

            }

            else if (admins) {
              bcrypt.compare(req.body.password, admins.password, (err, validepassword) => {
                if (err) {
                  res.json({ "message": "error" })
                }
                else if (!validepassword) {
                  res.status(400).json({ "message": "invalid email or passwod" })
                }
                else {
                  let payload = { subject: admins._id }
                  let token = jwt.sign(payload, 'secretKey')
                  res.status(200).json({ "message": "success", "token": token, type: 'admin', id: admins._id })
                }

              });
            }

            else if (agents) {

              if (agents.isApproved == "true") {
                bcrypt.compare(req.body.password, agents.password, (err, validepassword) => {
                  if (err) {
                    res.json({ "message": "error" })
                  }
                  else if (!validepassword) {
                    res.status(400).json({ "message": "invalid email or passwod" })
                  }
                  else {
                    let payload = { subject: agents._id }
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).json({ "message": "success", "token": token, type: 'travelAgent', id: agents._id })
                  }

                });
              }
              else if (agents.isApproved == "false") {

                res.status(400).json({ "message": "not approved" })
              }
              else {
                res.json({ "message": "error" })
              }

            }
            else {
              res.json({ "message": "invalid email or passwod" })
            }

          }
          else {
            res.json({ "message": "invalid email or passwod" })
          }

        })

      })
    })
  })


})



router.post("/forget/password", async (req, res) => {


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


  let admin = await adminModel.findOne({
    email: req.body.email
  });

  let travelAgent = await travelAgentModel.findOne({
    email: req.body.email
  });

  let doctor = await doctorModel.findOne({
    email: req.body.email
  });

  let patient = await patientModel.findOne({
    email: req.body.email
  });

  if (admin || travelAgent || doctor || patient) {

    let token

    if (admin) {
      let payload = { subject: admin._id }
      token = jwt.sign(payload, 'secretKey')
    }
    else if (travelAgent) {
      let payload = { subject: travelAgent._id }
      token = jwt.sign(payload, 'secretKey')
    }
    else if (doctor) {
      let payload = { subject: doctor._id }
      token = jwt.sign(payload, 'secretKey')
    }
    else {
      let payload = { subject: patient._id }
      token = jwt.sign(payload, 'secretKey')
    }
    let mailOptions = {
      from: 'DocTourism.com@gmail.com',
      to: req.body.email,
      subject: 'This E-mail is from DocTourism website',
      html:
        `
         
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
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique link to reset your
                                            password has been generated for you. To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href="http://localhost:4200/reset/password"
                                            style="background:#068eff;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
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

</html>

         `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error.message);
      }
      res.status(200).json({ "message": "success", "token": token })
    });

  }

  else {
    res.status(200).json({ "message": "error" })
  }


});


router.post("/reset/password", parseUrlencoded, async (req, res) => {

  var {
    error
  } = validate(req.body);

  if (error) {

    return res.status(400).json({ "message": "error" });
  }

  _email = req.body.email
  _password = req.body.password



  travelAgentModel.findOne({ email: _email }).exec((err, agents) => {
    if (err) {
      res.json({ "message": "error" })
    }
    adminModel.findOne({ email: _email }).exec((err, admins) => {
      if (err) {
        res.json({ "message": "error" })
      }
      patientModel.findOne({ email: _email }).exec((err, patients) => {
        if (err) {
          res.json({ "message": "error" })
        }
        doctorModel.findOne({ email: _email }).exec((err, doctors) => {
          if (err) {
            res.json({ "message": "error" })
          }

          if (agents) {
            bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                res.json({ "message": "error" })
              }
              bcrypt.hash(_password, salt, function (err, hash) {
                if (err) {
                  res.json({ "message": "error" })
                }
                travelAgentModel.update({ email: _email }, { password: hash }, (err, data) => {
                  if (err) {
                    res.json({ "message": "error" })
                  }
                  res.json({ "message": "success", "data": data })

                })
              })
            })
          }

          else if (admins) {
            bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                res.json({ "message": "error" })
              }
              bcrypt.hash(_password, salt, function (err, hash) {
                if (err) {
                  res.json({ "message": "error" })
                }
                adminModel.update({ email: _email }, { password: hash }, (err, data) => {
                  if (err) {
                    res.json({ "message": "error" })
                  }
                  res.json({ "message": "success", "data": data })

                })
              })
            })
          }

          else if (patients) {
            bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                res.json({ "message": "error" })
              }
              bcrypt.hash(_password, salt, function (err, hash) {
                if (err) {
                  res.json({ "message": "error" })
                }
                patientModel.update({ email: _email }, { password: hash }, (err, data) => {
                  if (err) {
                    res.json({ "message": "error" })
                  }
                  res.json({ "message": "success", "data": data })

                })
              })
            })
          }

          else if (doctors) {
            bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                res.json({ "message": "error" })
              }
              bcrypt.hash(_password, salt, function (err, hash) {
                if (err) {
                  res.json({ "message": "error" })
                }
                doctorModel.update({ email: _email }, { password: hash }, (err, data) => {
                  if (err) {
                    res.json({ "message": "error" })
                  }
                  res.json({ "message": "success", "data": data })

                })
              })
            })
          }
          else {
            res.json({ "message": "error1" })
          }

        })

      })
    })
  })
})


module.exports = router;
