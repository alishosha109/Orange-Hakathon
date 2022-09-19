const express  = require('express');
const router = express.Router();
const Student = require('../models/student')
const Session = require('../models/session')
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const checkAuth = require('../middleware/check-auth')

//get list of students
router.get("/", (req, res, next) => {
  Student.find()
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        students: docs,
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


//get one student
router.get("/:studentId", (req, res, next) => {
  Student.findById(req.params.studentId)
    .exec()
    .then(doc => {
      console.log(doc);
      if (!doc) {
        res.status(404).json({
          message: "student not found"
        });
      }else{
        res.status(200).json({
          student: doc,
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


//post
router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password,10,(err,hash)=>{
    if (err){
      return err.status(500).json({
        error:err
      });
    }else{
      const student = new Student({
        name: req.body.name,
        age: req.body.age,
        username: req.body.username,
        password: hash,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        college: req.body.college,
      });
      student
        .save()
        .then(result => {
          console.log(result);
          res.status(201).json({
            message: "New student added successfully",
            createdProduct: {
              name: result.name,
              age: result.age,
              _id: result._id,
              email: result.email,
              phone: result.phone,
              address: result.address,
              college: result.college,
              username: result.username,
              password: hash,
                request: {
                    type: 'GET',
                    status :201,
                    url: "http://localhost:4000/api/students/" + result._id
                }
            }
          });
        })
        .catch(err => {

          try{
            if (Object.keys(err.keyPattern)[0] == "username"){
              res.status(500).json({
                error: "Username must be unique"
              });
            }
          }catch(nothing){
            res.status(500).json({
              error: err.message
            });
          }

        });
    }
  });


});

router.post('/login',(req,res,next)=>{
  Student.find({username:req.body.username})
  .exec()
  .then(student=>{
    if(student.length <1){
      res.status(404).json({
          message:"user doesnt exist"
      });
    }else{
      bcrypt.compare(req.body.password,student[0].password,(err,result)=>{
          if(err){
            res.status(404).json({
                message:"Auth Failed"
            });
          }
          if(result){
            const token = jwt.sign({
              username:student[0].username,
              userId:student[0]._id,
            },process.env.JWT_KEY,
          {
            expiresIn: "1h",
          })
            res.status(200).json({
              message:"Auth Succeeded",
              token:token
            });
          }else{
            res.status(200).json({
              message:"Auth Failed"
            });
          }
      });
    }
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    });
  });
});

//update student //// must handle if someone tried to change password
router.patch("/:studentId",checkAuth, (req, res, next) => {
  const id = req.params.studentId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Student.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'student updated',
          request: {
              type: 'GET',
              status :200,
              url: 'http://localhost:4000/api/students/' + id
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


//delete student
router.delete("/:studentId",checkAuth, (req, res, next) => {
  const id = req.params.studentId;
  Student.findById(id)
  .exec()
  .then(doc =>{
      if (doc){

        Student.remove({ _id: id })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'student deleted',
                request: {
                    type: 'POST',
                    status :201,
                    url: 'http://localhost:4000/api/students',

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

router.get("/statuscode/:statuscode",checkAuth, (req, res, next) => {
  const status_code = req.params.statuscode;
  const studentid = req.params.studentid;
  console.log(status_code)
  Session.find({status_message: status_code,})
    .populate('student')
    .exec()
    .then(doc => {
      console.log("From database", doc.l);
      if (doc.length>0) {
        res.status(200).json({
          count: doc.length,
          students: doc.map(doc => {
            return doc.student;
          }),
          request: {
            type: "GET",
            url: "http://localhost:4000/api/examreviews/"
          }
        })

      } else {
        res
          .status(404)
          .json({ message: "No entries" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


module.exports = router
