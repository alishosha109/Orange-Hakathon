
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
const Schema = mongoose.Schema
const checkAuth = require('../middleware/check-auth')

//get all courses
router.get("/", (req, res, next) => {
  Course.find()
    .populate('category', 'name')
    .populate('trainer', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        courses: docs.map(doc => {
          return {
            _id: doc._id,
            name: doc.name,
            level: doc.level,
            category: doc.category,
            trainer: doc.trainer,
            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/courses/" + doc._id
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


//get one course
router.get("/:courseId", (req, res, next) => {
  Course.findById(req.params.courseId)
    .populate('category', 'name')
    .populate('trainer', 'name')
    .exec()
    .then(course => {
      if (!course) {
        return res.status(404).json({
          message: "course not found"
        });
      }
      res.status(200).json({
        course: course,
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/courses"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// add a new course to the db
router.post("/",checkAuth, (req, res, next) => {
  Category.findById(req.body.category)
    .then(category => {
      if (!category) {
        return res.status(404).json({
          message: "Category not found"
        });
      }
      const course = new Course({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        level: req.body.level,
        category: req.body.category
      });
      return course.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "course stored",
        createdOrder: {
          _id: result._id,
          name: result.name,
          level: result.level
        },
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/courses/" + result._id
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

// update course in the db
router.patch("/:courseId",checkAuth, (req, res, next) => {
  const id = req.params.courseId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Course.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Course updated',
          request: {
              type: 'GET',
              status :200,
              url: 'http://localhost:4000/api/courses/' + id
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

// delete a course from db
router.delete("/:courseId", checkAuth,(req, res, next) => {
  const id = req.params.courseId;
  Course.findById(id)
  .exec()
  .then(doc =>{
      if (doc){

        Course.remove({ _id: id })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'Course deleted',
                Courses: {
                    type: 'POST',
                    status :201,
                    url: 'http://localhost:4000/api/courses',

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



//get the trainer of specific course
router.get("/trainer/:courseId", (req, res, next) => {
  Course.findById(req.params.courseId)
    .select('course name trainer')
    .populate('trainer', 'name')
    .exec()
    .then(course => {
      if (!course) {
        return res.status(404).json({
          message: "course not found"
        });
      }
      res.status(200).json({
        trainer: course.trainer,
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/courses"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//get category details of specific course
router.get("/category/:courseId", (req, res, next) => {
  Course.findById(req.params.courseId)
    .select('course name category')
    .populate('category', 'name')
    .exec()
    .then(course => {
      if (!course) {
        return res.status(404).json({
          message: "course not found"
        });
      }
      res.status(200).json({
        course: course,
        request: {
          type: "GET",
          status :200,
          url: "http://localhost:4000/courses"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});


//get all courses in specific level
router.get("/level/:levelname", (req, res, next) => {
  Course.find({level: req.params.levelname})
    .populate('category', 'name')
    .populate('trainer', 'name')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        Courses: docs.map(doc => {
          return {
            name: doc.name,
            _id: doc._id,
            trainer: doc.trainer,
            category: doc.category,

            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/courses/" + doc._id
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


//get all courses in specific trainer           ////////////////////not working w mn2lthash
router.get("/all_courses_trainer/:trainerId", (req, res, next) => {
  Course.find({trainer: mongoose.Types.ObjectId(req.params.trainerId)})
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        Courses: docs.map(doc => {
          return {
            name: doc.name,
            _id: doc._id,
            trainer: doc.trainer,
            category: doc.category,

            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/courses/" + doc._id
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

//get all courses in specific category
router.get("/all_courses_category/:categoryId", (req, res, next) => {
  Course.find({category: mongoose.Types.ObjectId(req.params.categoryId)})
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        Courses: docs.map(doc => {
          return {
            name: doc.name,
            _id: doc._id,
            trainer: doc.trainer,
            category: doc.category,

            request: {
              type: "GET",
              url: "http://localhost:4000/api/course/" + doc._id
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
