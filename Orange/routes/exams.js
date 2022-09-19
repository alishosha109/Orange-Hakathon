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
const moment = require('moment');


//get all exams
router.get("/", (req, res, next) => {
  Exam.find()
    .populate('questions', 'content')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        exams: docs.map(doc => {
          return {
            _id: doc._id,
            questions: doc.questions,

            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/exams/" + doc._id
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


//get one exam by student
router.get("/:examId", (req, res, next) => {

  Exam.findById(req.params.examId)
  .populate('questions', 'correct_answer')
    .exec()
    .then(exam => {
      if (!exam) {
         res.status(404).json({
          message: "exam not found"
        });
      }else{

        var CurrentDate = moment().format();
        console.log(CurrentDate);

        let datecreate = exam.createdAt;
        console.log(datecreate);
        console.log(moment(CurrentDate));
        console.log(moment(datecreate).utc());
        //console.log(moment(datecreate).format('MMMM d, YYYY'));
      //  console.log(moment().subtract(24, 'hours').toDate());

        let dif = moment(CurrentDate).diff(moment(datecreate).utc(), 'minutes');
        if (dif >= 2880){
          //make status message rejected
                  Session.find({exam :exam._id})
                  .then(status =>{
                    //console.log(status);
                    const updateOps = {};
                    updateOps['status_message'] = "rejected";
                    //console.log(updateOps);
                    //console.log(status[0]._id);

                    Session.update({ _id: mongoose.Types.ObjectId(status[0]._id) }, { $set: updateOps })
                    .then(del =>{
                                Exam.remove({ _id: exam._id })
                                  .exec()
                                  .then(result => {
                                    res.status(500).json({
                                        message: 'Exam duration has exceeded two days',
                                        request: {
                                            type: 'Delete',
                                            status :500,
                                            url: 'http://localhost:4000/api/exams',
                                        }
                                    });
                                  })
                                  .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                      message: 'Exam duration has exceeded two days',
                                    });
                                  });


                    })
                    .catch(err => {
                      console.log(err);
                      res.status(500).json({
                        error: err
                      });
                    });
                  });
        }else{
          Session.findOneAndUpdate({exam:exam._id},{ status_message: "Before Exam" }).exec().then(session=>{
            console.log(session);
            res.status(200).json({
              exam: exam,
              request: {
                type: "GET",
                status :200,
                url: "http://localhost:4000/exams"
              }
            });
          });

        }

      }

    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// add a new exam to the db
router.post("/:courseId/:studentId/:access_code", checkAuth,(req, res, next) => {
  Session.find({student:req.params.studentId}).exec().then(result=>{
    console.log(result);
    console.log("here it is result code",result.code);
    console.log("here it is",req.params.access_code);
    if(result[0].code === req.params.access_code){
      Question.find({course: mongoose.Types.ObjectId(req.params.courseId)})
        .exec()
        .then(docs => {
          console.log(docs);
          const allq = [];
          for (const i of docs) {
            allq.push(i._id);
          }

          //finalQ = allq[0:1];
          const shuffled = allq.sort((a, b) => 0.5 - Math.random());
          let selected = shuffled.slice(0, 2);
          //console.log(shuffled);

          const exam = new Exam({
            _id: mongoose.Types.ObjectId(),
            questions: selected
          });
           return exam.save();

        }).then(exam=>{
          Session.findOneAndUpdate({student:req.params.studentId},{exam:exam._id}).exec().then(result => {
              console.log(result);
              res.status(201).json({
                message: "Exam stored",
                createdExam:exam,
                request: {
                  type: "GET",
                  status :200,
                  url: "http://localhost:4000/exams/"
                }
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
        })
    }else{
      res.status(500).json({
        error:"Wrong Code"
      })
    }
  });

});

// update exam in the db
router.patch("/:examId", checkAuth,(req, res, next) => {
  const id = req.params.examId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Exam.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Exam updated',
          request: {
              type: 'GET',
              status :200,
              url: 'http://localhost:4000/api/exams/' + id
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


// delete a exam from db
router.delete("/:examId",checkAuth, (req, res, next) => {
  const id = req.params.examId;
  Exam.findById(id)
  .exec()
  .then(doc =>{
      if (doc){

        Exam.remove({ _id: id })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'Admin deleted',
                request: {
                    type: 'POST',
                    status :201,
                    url: 'http://localhost:4000/api/exams',
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




module.exports = router;
