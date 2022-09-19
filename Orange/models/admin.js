const mongoose = require('mongoose')
const Schema = mongoose.Schema


const AdminSchema = new Schema({
  name:{ type: String,required: true,},
  phone:{ type: String, maxLength: 11, minLength:11,},
  username:{ type: String ,required: true,index: { unique: true }, maxLength: 15,},
  password:{ type: String,required: true,},
  role:{type:String},
}, { timestamps: true } );


const Admin = mongoose.model('admin', AdminSchema);

module.exports = Admin;
