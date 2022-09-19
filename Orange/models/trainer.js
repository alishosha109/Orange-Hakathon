const mongoose = require('mongoose')
const Schema = mongoose.Schema


const TrainerSchema = new Schema({
  name:{ type: String,required: true,},
}, { timestamps: true } );


const Trainer = mongoose.model('trainer', TrainerSchema);

module.exports = Trainer;
