const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId} = mongoose.Schema;


var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};
const StudentSchema = new Schema({
  name:{ type: String,required: true,},
  age: { type: Number, min: 18, max: 25 },
  email:{
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
  phone:{ type: String,required: true, maxLength: 11, minLength:11,},
  address:{ type: String,},
  college:{ type: String,},
  username:{ type: String,required: true, index: { unique: true }, maxLength: 15,},
  password:{ type: String,required: true,},
}, { timestamps: true } );


const Student = mongoose.model('student', StudentSchema);

module.exports = Student;
