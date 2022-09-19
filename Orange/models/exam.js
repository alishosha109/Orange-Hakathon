const mongoose = require('mongoose')
const Schema = mongoose.Schema



const ExamSchema = new Schema({
  questions:[{type:Schema.Types.ObjectId,ref:"question",required:true}],
}, { timestamps: true } );


const Exam = mongoose.model('exam', ExamSchema);

module.exports = Exam;
