const mongoose = require('mongoose')
const Schema = mongoose.Schema


const ExamReviewSchema = new Schema({
  student:{type:Schema.Types.ObjectId,ref:"student",required:true},
  exam:{type:Schema.Types.ObjectId,ref:"exam",required:true,index: { unique: true }},
  answers :[{type: String,required:true}],
  no_of_correct:{type:Number,required:true},
  result:{type:String,required:true},
}, { timestamps: true } );


const ExamReview = mongoose.model('examreview', ExamReviewSchema);

module.exports = ExamReview;
