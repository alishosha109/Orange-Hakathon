const express  = require('express');
const StudentRoutes = require('./routes/students')
const TrainerRoutes = require('./routes/trainers')
const CourseRoutes = require('./routes/courses')
const AdminRoutes = require('./routes/admins')
const CategoryRoutes = require('./routes/categories')
const SessionRoutes = require('./routes/sessions')
const ExamRoutes = require('./routes/exams')
const QuestionRoutes = require('./routes/questions')
const ExamReviewRoutes = require('./routes/examreviews')

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan')

//set up express app

const app = express();

//connect to mongoose

mongoose.connect('mongodb://localhost/test_orange');
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin',"*");
  res.header('Access-Control-Allow-Headers',"*");
  if(req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Headers','PUT,POST,PATCH,DELETE,GET');
    return res.status(200).json({});
  }
  next();
});
//initialize routes
app.use('/api/students',StudentRoutes);
app.use('/api/trainers',TrainerRoutes);
app.use('/api/courses',CourseRoutes);
app.use('/api/admins',AdminRoutes);
app.use('/api/examreviews',ExamReviewRoutes);
app.use('/api/questions',QuestionRoutes);
app.use('/api/exams',ExamRoutes);
app.use('/api/sessions',SessionRoutes);
app.use('/api/categories',CategoryRoutes);


// error handling middleware
app.use((req,res,next)=>{
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});


app.use((error,req,res,next)=>{
  res.status(error.status||500);
  res.json({
    error:{
      message:error.message
    }
  });
});

module.exports = app;
