

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


//get all exam_reviews
router.get("/", (req, res, next) => {
  Exam_review.find()
    .populate('student', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            student: doc.student,
            exam: doc.exam,
            answers: doc.answers,
            no_of_correct: doc.no_of_correct,
            result: doc.result,
            request: {
              type: "GET",
              url: "http://localhost:4000/api/examreviews/" + doc._id
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

//get one exam_review
router.get("/:exreviewId",checkAuth, (req, res, next) => {
  Exam_review.findById(req.params.exreviewId)
    .populate('student', 'name')
    .exec()
    .then(course => {
      if (!course) {
        res.status(404).json({
          message: "No Valid ID for this entry"
        });
      }else{
        res.status(200).json({
          course: course,
          request: {
            type: "GET",
            status :200,
            url: "http://localhost:4000/examreviews"
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

// add a new exam_review to the db
router.post("/", checkAuth,(req, res, next) => {

  Exam.findById(req.body.exam)
  .populate("questions", "correct_answer")
  .then(x =>{
      let correctans = [];
      for (let i in x.questions) {
          correctans.push(x.questions[i].correct_answer);
        }
      //console.log(correctans);
      //console.log(req.body.answers);
      let ans = req.body.answers;
      let intersection = ans.filter(x => correctans.includes(x));

      let resul = 'fail';
      if(intersection.length > ans.length/2)
        resul = 'success'

      if(resul == 'fail'){
        Session.find({exam :mongoose.Types.ObjectId( req.body.exam)})
        .then(status =>{
          //console.log(status);
          const updateOps = {};
          updateOps['status_message'] = "rejected";
          console.log(updateOps);
          console.log(status[0]._id);

          Session.update({ _id: mongoose.Types.ObjectId(status[0]._id) }, { $set: updateOps })
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
      }// if
      else{
        Session.find({exam :mongoose.Types.ObjectId( req.body.exam)})
        .then(status =>{
          //console.log(status);
          const updateOps = {};
          updateOps['status_message'] = "After Exam";
          console.log(updateOps);
          console.log(status[0]._id);

          Session.update({ _id: mongoose.Types.ObjectId(status[0]._id) }, { $set: updateOps })
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
      }

      const examreview = new Exam_review({
        _id: mongoose.Types.ObjectId(),
        student: req.body.student,
        exam: req.body.exam,
        answers: req.body.answers,
        no_of_correct: intersection.length,
        result: resul
      });
      ans = req.body.answers;
      examreview.save()
      //console.log(rev.answers);

    .then(result => {
      //console.log(req.body.exam);
      res.status(201).json({
        message: "exam review stored",
        createdOrder: {
          _id: result._id,
          student: result.student,
          exam: result.exam,
          answers: result.answers,
          no_of_correct: result.no_of_correct,
          result: result.result,
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/examreviews/" + result._id
        }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
  }); //then

});

// update exam_review in the db
router.patch("/:exreviewId",checkAuth, (req, res, next) => {
  const id = req.params.exreviewId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Exam_review.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Exam Review updated',
          request: {
              type: 'GET',
              url: 'http://localhost:4000/api/course/' + id
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

// delete a exam_review from db
router.delete("/:exreviewId",checkAuth, (req, res, next) => {
  const id = req.params.exreviewId;
  Exam_review.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Exam Review deleted',
          request: {
              type: 'POST',
              url: 'http://localhost:4000/api/examreviews',
              //body: {name:'String',}
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



//get answers of a specific exam of a specific student
router.get("/answersexam/:idex/:id/",checkAuth, (req, res, next) => {
  Exam_review.find({exam: mongoose.Types.ObjectId(req.params.idex), student: mongoose.Types.ObjectId(req.params.id)})
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        Reviews: docs.map(doc => {
          return {
            review: doc,

          };
        }),
        request: {
          type: "GET",
          url: "http://localhost:4000/api/examreviews/"
        }
      };
      res.status(200).json(response);

    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


//get all exam reviews of specific student
router.get("/all_reviews_student/:studentId",checkAuth, (req, res, next) => {
  Exam_review.find({student: mongoose.Types.ObjectId(req.params.studentId)})
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        Reviews: docs.map(doc => {
          return {
            _id: doc._id,
            student: doc.student,
            exam: doc.exam,
            answers: doc.answers,
            no_of_correct: doc.no_of_correct,
            result: doc.result,

            request: {
              type: "GET",
              url: "http://localhost:4000/api/examreviews/" + doc._id
            }
          };
        })
      };
      res.status(200).json(response);

    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


module.exports = router;
