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


io.on('connection', (socket) => {
  console.log('new user connected')
  socket.emit("fromServer", "hello from Server")
  socket.on('fromFront', (data) => {
    console.log(data)
  })
})

// app.get('/test' , (req,res)=>{
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//      ;
//       res.send(re.test(String("khaledkamal22@23.3333").toLowerCase()))
// })

server.listen(8085)