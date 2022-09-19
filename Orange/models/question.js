const mongoose = require('mongoose')
const Schema = mongoose.Schema


const QuestionSchema = new Schema({
  course:{type:Schema.Types.ObjectId,ref:"course",required:true},
  content :{ type: String,required:true,index: { unique: true }},
  choices: [{type: String,required:true}],
  correct_answer: {type:String,required:true},
}, { timestamps: true } );


const Question = mongoose.model('question', QuestionSchema);

module.exports = Question;
