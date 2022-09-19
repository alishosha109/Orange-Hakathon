const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId} = mongoose.Schema;


const SessionSchema = new Schema({
  student:{type:Schema.Types.ObjectId,ref:"student",required:true},
  course:{type:Schema.Types.ObjectId,ref:"course",required:true},
  exam:{type:Schema.Types.ObjectId,ref:"exam",index: { unique: true }},
  status_message:{ type: String,default: "request code",},
  code:{type: String, index: { unique: true }}
}, { timestamps: true } );


const Session = mongoose.model('session', SessionSchema);
module.exports = Session;
