var mongoose = require('mongoose')

let programsModel = new mongoose.model('programs', {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        max: 30
    },
    location: {

        type: Object,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    discription: {
        type: String,
        required: true,
        min: 20
    },
    travelAgentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'travelAgent'
    },
    IMG: {
        type: String
    }
})
module.exports = programsModel


