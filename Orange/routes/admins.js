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
const bcrypt = require('bcrypt')
const checkAuth = require('../middleware/check-auth')
const jwt = require('jsonwebtoken')


router.get("/", (req, res, next) => {
  Admin.find()
    //.select("name price _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        admins: docs.map(doc => {
          return {
            name: doc.name,
            phone: doc.phone,
            _id: doc._id,
            username: doc.username,
            password: doc.password,
            role: doc.role,
            request: {
              type: "GET",
              url: "http://localhost:4000/api/admin/" + doc._id
            }
          };
        })
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

//get one admin
router.get("/:adminId", (req, res, next) => {
  const id = req.params.adminId;
  Admin.findById(id)
    //.select('name price _id')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
            name: doc.name,
            phone: doc.phone,
            _id: doc._id,
            username: doc.username,
            password: doc.password,
            role: doc.role,
            request: {
                type: 'GET',
                url: 'http://localhost:4000/api/admin/'
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


// add new admin
router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password,10,(err,hash)=>{
    if (err){
       err.status(500).json({
        error:err
      });
    }else{
      const admin = new Admin({
        name: req.body.name,
        username: req.body.username,
        password: hash,
        phone: req.body.phone
      });
      admin
        .save()
        .then(result => {
          console.log(result);
          res.status(201).json({
            message: "New admin added successfully",
            createdAdmin: {
              name: result.name,
              _id: result._id,
              phone: result.phone,
              username: result.username,
              password: hash,
                request: {
                    type: 'GET',
                    status :201,
                    url: "http://localhost:4000/api/admins/"
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
  Admin.find({username:req.body.username})
  .exec()
  .then(admin=>{
    if(admin.length <1){
      res.status(404).json({
          message:"user doesnt exist"
      });
    }else{
      bcrypt.compare(req.body.password,admin[0].password,(err,result)=>{
          if(err){
            res.status(404).json({
                message:"Auth Failed"
            });
          }
          if(result){
            const token = jwt.sign({
              username:admin[0].username,
              userId:admin[0]._id,
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

//update admin
router.patch("/:adminId",checkAuth, (req, res, next) => {
  const id = req.params.adminId;
  const updateOps = {};
  for (const ops of Object.keys(req.body)) {
    updateOps[ops] = req.body[ops];
  }
  Admin.findById(id)
    //.select('name price _id')
    .exec().then(doc=>{
      if(doc){
        console.log(doc);
        Admin.update({ _id: id }, { $set: updateOps })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'Admin updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:4000/api/admin/' + id
                }
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
      }else{
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    }).catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });;

});


//delete admin
router.delete("/:adminId",checkAuth, (req, res, next) => {
  const id = req.params.adminId;
  Admin.findById(id)
  .exec()
  .then(doc =>{
      if (doc){

        Admin.remove({ _id: id })
          .exec()
          .then(result => {
            res.status(200).json({
                message: 'Admin deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:4000/api/admin',
                    body: {name:'String',
                          phone:'String',
                          username:'String',
                          password:'String',
                          role:'String',
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
      }
      else{
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }

  })

});

//get all admins in specific role
router.get("/role/:rolename", (req, res, next) => {
  const id = req.params.rolename;
  Admin.find({role: id})
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        const response = {
          count: doc.length,
          admins :doc.map(doc => {
            return{
              name: doc.name,
              phone: doc.phone,
              username: doc.username,
              password: doc.password,
              role: doc.role,
              _id: doc._id,
              request: {
                  type: 'GET',
                  url: 'http://localhost:4000/api/admin'
              }
            };
          })

        }
        res.status(200).json(response);

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


module.exports = router;
