const mongoose = require('mongoose')
const Schema = mongoose.Schema



const CourseSchema = new Schema({
  name:{type:String,required:true,index: { unique: true }},
  level :{type: String,required:true},
  trainer:{type:Schema.Types.ObjectId,ref:"trainer"},
  category:{type:Schema.Types.ObjectId,ref:"category",required:true},
}, { timestamps: true } );


const Course = mongoose.model('course', CourseSchema);

module.exports = Course;
