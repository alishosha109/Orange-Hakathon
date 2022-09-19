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
  Category.find()
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        categories: docs.map(doc => {
          return {
            name: doc.name,
            _id: doc._id,

            request: {
              type: "GET",
              status :200,
              url: "http://localhost:4000/api/categories/" + doc._id
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



//get one category
router.get("/:categoryId", (req, res, next) => {
  const id = req.params.categoryId;
  Category.findById(id)
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
                url: 'http://localhost:4000/api/categories/'
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

// add a new category to the db
router.post("/", (req, res, next) => {
  const category = new Category({
    name: req.body.name,
  });
  category
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "New category added successfully",
        createdCategory: {
            name: result.name,
            _id: result._id,
            request: {
                type: 'GET',
                status :200,
                url: "http://localhost:4000/api/categories/" + result._id
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

// update category in db
router.patch("/:categoryId",checkAuth, (req, res, next) => {
  const id = req.params.categoryId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Category.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Category updated',
          request: {
              type: 'GET',
              status :200,
              url: 'http://localhost:4000/api/categories/' + id
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

// delete a category from db
router.delete("/:categoryId", checkAuth,(req, res, next) => {
  const id = req.params.categoryId;
  Category.findById(id)
  .exec()
  .then(doc =>{
      if (doc){
  Category.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Category deleted',
          request: {
              type: 'POST',
              status :201,
              url: 'http://localhost:4000/api/categories',
              body: {name:'String',}
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
