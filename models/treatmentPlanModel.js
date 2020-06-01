var mongoose = require('mongoose')

let treatmentPlanModel = new mongoose.model('treatmentPlan', {
    _id: mongoose.Schema.Types.ObjectId,

    treatmentDate: { //hold duration "from" and "to" dates
        type: Object,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        min: 20,
        required: true
    },

    patientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    accept_flag: {
         type: Boolean 
        }
})

module.exports = treatmentPlanModel 