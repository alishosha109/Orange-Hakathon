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
  Trainer.find()
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        admins: docs.map(doc => {
          return {
            name: doc.name,
            _id: doc._id,
            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/trainers/" + doc._id
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

//get one trainer
router.get("/:trainerId", (req, res, next) => {
  const id = req.params.trainerId;
  Trainer.findById(id)
    //.select('name price _id')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
            name: doc.name,
            _id: doc._id,
            request: {
                type: 'GET',
                status :200,
                url: 'http://localhost:4000/api/trainers/'
            }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


// add a new trainer to the db
router.post("/",checkAuth, (req, res, next) => {
  const trainer = new Trainer({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name
  });
  trainer
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "New trainre added successfully",
        createdTrainer: {
            name: result.name,
            _id: result._id,
            request: {
                type: 'GET',
                status :200,
                url: "http://localhost:4000/api/trainers/" + result._id
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
});

// update trainer in the db
router.patch("/:trainerId",checkAuth, (req, res, next) => {
  const id = req.params.trainerId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Trainer.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Trainer updated',
          request: {
              type: 'GET',
              status :200,
              url: 'http://localhost:4000/api/trainers/' + id
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

// delete a trainer from db
router.delete("/:trainerId",checkAuth, (req, res, next) => {
  const id = req.params.trainerId;
  Trainer.findById(id)
  .exec()
  .then(doc =>{
      if (doc){
        Trainer.remove({ _id: id })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'trainer deleted',
                request: {
                    type: 'POST',
                    status :201,
                    url: 'http://localhost:4000/api/trainers',
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
