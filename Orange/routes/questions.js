

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





router.get("/", (req, res, next) => {
  Question.find()
    .populate('course', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        questions: docs.map(doc => {
          return {
            _id: doc._id,
            course: doc.course,
            content: doc.content,
            choices: doc.choices,
            correct_answer: doc.correct_answer,
            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/questions/" + doc._id
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

//get one question
router.get("/:questionId", (req, res, next) => {
  Question.findById(req.params.questionId)
    .populate('course', 'name')
    .exec()
    .then(question => {
      if (!question) {
        res.status(404).json({
          message: "question not found"
        });
      }else{
        res.status(200).json({
          question: question,
          request: {
            type: "GET",
            status :200,
            url: "http://localhost:4000/questions"
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


// add a new question to the db
router.post("/",checkAuth, (req, res, next) => {
  Course.findById(req.body.course)
    .then(course => {
      if (!course) {
        return res.status(404).json({
          message: "course not found"
        });
      }
      const question = new Question({
        _id: mongoose.Types.ObjectId(),
        course: req.body.course,
        content: req.body.content,
        choices: req.body.choices,
        correct_answer: req.body.correct_answer
      });
      return question.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "question stored",
        createdquestion: {
          _id: result._id,
          course: result.course,
          content: result.content,
          choices: result.choices,
          correct_answer: result.correct_answer,
        },
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/questions/" + result._id
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


// update question in the db
router.patch("/:questionId",checkAuth, (req, res, next) => {
  const id = req.params.questionId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Question.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Question updated',
          request: {
              type: 'GET',
              status :200,
              url: 'http://localhost:4000/api/questions/' + id
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

// delete a question from db
router.delete("/:questionId",checkAuth, (req, res, next) => {
  const id = req.params.questionId;
  Question.findById(id)
  .exec()
  .then(doc =>{
      if (doc){

        Question.remove({ _id: id })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'Question deleted',
                request: {
                    type: 'POST',
                    status :201,
                    url: 'http://localhost:4000/api/questions',

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
//get the course of the question
router.get("/course/:questionId", (req, res, next) => {
  Question.findById(req.params.questionId)
    .select('question course content')
    .populate('course', 'name')
    .exec()
    .then(question => {
      if (!question) {
        return res.status(404).json({
          message: "question not found"
        });
      }
      res.status(200).json({
        question: question,
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/questions"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//get all questions in specific course //Not working
router.get("/questionscourse/:courseId", (req, res, next) => {
  Question.find({course: mongoose.Types.ObjectId(req.params.courseId)})
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        questions: docs.map(doc => {
          return {
            content: doc.content,
            _id: doc._id,
            choices: doc.choices,
            correct_answer: doc.correct_answer,

            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/questions/" + doc._id
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
