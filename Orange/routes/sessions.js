

const express = require ('express');
const router = express.Router();
const mongoose = require("mongoose");
const Admin = require('../models/admin');
const Student = require('../models/student');
const Category = require('../models/category');
const Course = require('../models/course');
const Exam_review = require('../models/exam_review');
const Exam = require('../models/exam');
const Question = require('../models/question');
const Session = require('../models/session');
const Trainer = require('../models/trainer');
const checkAuth = require('../middleware/check-auth')

var nodemailer = require('nodemailer');





router.get("/", (req, res, next) => {
  Session.find()
    .populate('student', 'name')
    .populate('course', 'name')
    //.populate('exam', 'question')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        sessions: docs.map(doc => {
          return {
            _id: doc._id,
            student: doc.student,
            course: doc.course,
            exam: doc.exam,
            status_message: doc.status_message,
            code: doc.code,
            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/sessions/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//get one session
router.get("/:sessionId", (req, res, next) => {
  Session.findById(req.params.sessionId)
    .populate('student', 'name')
    .populate('course', 'name')
    .exec()
    .then(session => {
      if (!session) {
        res.status(404).json({
          message: "session not found"
        });
      }else{
        res.status(200).json({
          session: session,
          request: {
            type: "GET",
            status :200,
            url: "http://localhost:4000/sessions"
          }
        });
      }

    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// add a new session to the db
router.post("/",checkAuth, (req, res, next) => {
  Student.findById(req.body.student)
    .exec()
    .then(student => {
      console.log(student);
      if (!student) {
        return res.status(404).json({
          message: "student not found"
        });
      }
      const session = new Session({
        _id: mongoose.Types.ObjectId(),
        status_message: req.body.status_message,
        student: req.body.student,
        course:req.body.course,
        exam:req.body.exam,
        code:req.body.code
      });
      return session.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "session stored",
        createdSession: {
          _id: result._id,
          status_message: result.status_message,
          student: result.student
        },
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/api/sessions/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// update session in the db
router.patch("/:sessionId",checkAuth, (req, res, next) => {
  const id = req.params.sessionId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Session.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Session updated',
          request: {
              type: 'GET',
              status :200,
              url: 'http://localhost:4000/api/sessions/' + id
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// delete a session from db
router.delete("/:sessionId",checkAuth, (req, res, next) => {
  const id = req.params.sessionId;
  Session.findById(id)
  .exec()
  .then(doc =>{
      if (doc){

        Session.remove({ _id: id })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'session deleted',
                request: {
                    type: 'POST',
                    status : 201,
                    url: 'http://localhost:4000/api/sessions',

                }
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
      }
      else{
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }

  })

});
router.get('/sessionforstudent/:studentId',checkAuth,(req,res,next)=>{
    const stdid = req.params.studentId;
    Session.find({student:stdid}).exec().then(result=>{
      res.status(200).json({
        count:result.length,
        sessions:result,
        request:{
          type:"GET",
          status_code:"200"
        }

      })
    }).catch(err => {
      res.status(500).json({
        error:err
      })
    })
});
//update code in session (send code)
router.patch("/sendcode/:sessionId",checkAuth, (req, res, next) => {
  const id = req.params.sessionId;
  const updateOps = {};
  var student_email = "";
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }

  let code = Math.floor((Math.random() * 999999) + 9999);
  Session.findById({_id:id})
    //.select("status_message")
    .then(result => {
      //const ObjectId = result.student.toString();

      //console.log(ObjectId);
          Student.findById({_id: result.student})
          .then(emailres =>{
             student_email = emailres.email;
             if (result.status_message != 'rejected'){
               Session.update({ _id: id },{ code: code })
                 .exec()
                 .then(result2 => {
                   res.status(200).json({
                       message: 'Code in session updated',
                       request: {
                           type: 'GET',
                           status :200,
                           url: 'http://localhost:4000/api/sessions/' + id
                       }
                   });
                   console.log(student_email);

                   var transporter = nodemailer.createTransport({
                   service: 'outlook',
                   auth: {
                     user: 'menna_mam@hotmail.com',
                     pass: 'spongebob'
                   }
                 });
                console.log("here it is the code"+result.code);
                 var mailOptions = {
                   from: 'menna_mam@hotmail.com',
                   to: "m.m.m.elhossin@gmail.com",
                   subject: 'Code for your odc exam',
                   text: result.code
                 };

                 transporter.sendMail(mailOptions, function(error, info){
                   if (error) {
                     console.log(error);
                   } else {
                     console.log('Email sent: ' + info.response);
                   }
                 });
                 })
                 .catch(err => {
                   console.log(err);
                   res.status(500).json({
                     error: err
                   });
                 });

             }
             else{
               res.status(404).json({
                         message: 'student is rejected'
                     });
             }
          });


    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
        message : "invalid ID"
      });
    });


});




module.exports = router;
