const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors");
const server = require('http').createServer(app)
const io = require("socket.io")(server)
app.use(bodyParser.json())



mongoose.connect("mongodb://localhost:27017/DocTourism")
mongoose.connection.on("error", err => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(1);
});

app.use(
  cors({
    origin: ' http://localhost:4200',
    credentials: true,
    maxAge: 1000000
  })

)

var doctor = require("./controllers/doctor")
var patient = require("./controllers/patient")
var login = require("./controllers/login")
var travelAgent = require("./controllers/travelAgent")
var admin = require("./controllers/admin")
app.use("/doctor", doctor)
app.use("/patient", patient)
app.use('/login', login)
app.use('/travelAgent', travelAgent)
app.use('/admin', admin)



server.listen(8085)