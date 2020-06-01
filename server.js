const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors");
const server = require('http').createServer(app)
const io = require("socket.io")(server)
app.use(bodyParser.json())



mongoose.connect("mongodb://localhost:27017/DOC")
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
app.use("/doctor" , doctor)
app.use("/patient" , patient)
app.use('/login' , login)


io.on('connection', (socket) => {
  console.log('new user connected')
  socket.emit("fromServer", "hello from Server")
  socket.on('fromFront' , (data)=>{
    console.log(data)
  })
})

server.listen(8080)