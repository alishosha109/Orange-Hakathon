const Trainer = require('../models/trainer.js')
const Category = require('../models/category.js')
const Admin = require('../models/admin.js')
const Course = require('../models/course.js')
const ExamReview = require('../models/exam_review.js')
const Exam = require('../models/exam.js')
const Question = require('../models/question.js')
const Session = require('../models/session.js')
const Student = require('../models/student.js')

const assert = require('assert');
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

// Describe our tests
describe('adding records', function(){
    this.timeout(10000) // all tests in this suite get 10 seconds before timeout


    it('Delete Model', function(done){

      delete mongoose.connection.models['Admin'];
      done();

    });
    // beforeEach(function(done){
    //     // Drop the collection
    //     mongoose.connection.collections.admins.drop(function(){
    //         done();
    //     });
    // });
    //
    // // beforeEach(function(done){
    // //     // Drop the collection
    // //     mongoose.connection.collections.students.drop(function(){
    // //         done();
    // //     });
    // // });
    // // Create tests
    // it('Creates a trainer', function(done){
    //
    //     var trainer = new Trainer({
    //         name: 'Eng/ Mohamed El houssiny',
    //     });
    //
    //     trainer.save().then(function(){
    //         assert(trainer.isNew ===false);
    //         done();
    //     });
    //
    // });
    //
    //
    //
    //
    //
    // it('Creates a category', function(done){
    //
    //     var category = new Category({
    //         name: 'Marketing',
    //     });
    //
    //     category.save().then(function(){
    //         assert(category.isNew ===false);
    //         done();
    //     });
    //
    // });
    //
    //
    // it('Creates an admin', function(done){
    //
    //     var admin = new Admin({
    //       name:"orange_admin",
    //       phone:"01111111111",
    //       username:"odcadmin",
    //       password:"hashedpassword",
    //       role:"admin",
    //     });
    //
    //     admin.save().then(function(){
    //         assert(admin.isNew ===false);
    //         done();
    //     });
    //
    // });
    //
    //
    //
    //
    // it('Creates a course', function(done){
    //
    //     var course = new Course({
    //       name:"Marketing 102",
    //       level:"2",
    //     });
    //
    //     Trainer.findOne({_id:"624aa9f8483f3233693469f3"}).then(function(result){
    //       Category.findOne({_id:"624aab3018bb849c57fb0fb6"}).then(function(result2){
    //         course.trainer = result._id;
    //         course.category = result2._id;
    //         course.save().then(function(){
    //             assert(course.isNew ===false);
    //             done();
    //         }).catch(done);
    //       });
    //     });
    //
    //
    //
    // });
    //
    //
    // it('Creates a question', function(done){
    //
    //     var question = new Question({
    //       content:"What are Data Types?",
    //       choices:["int","String","Boolean","All"],
    //       correct_answer:"All"
    //     });
    //
    //     Course.findOne({_id:"624acb01ea2df9657e1768a6"}).then(function(result){
    //         question.course = result._id;
    //         question.save().then(function(){
    //             assert(question.isNew ===false);
    //             done();
    //         }).catch(done);
    //       });
    // });
    //
    //
    //
    // it('Creates an exam', function(done){
    //
    //     var exam = new Exam({
    //       questions:[]
    //     });
    //
    //     Question.findOne({_id:"624acff32db903000bc9549e"}).then(function(result){
    //         exam.question = exam.questions.push(result._id);
    //         exam.save().then(function(){
    //             assert(exam.isNew ===false);
    //             done();
    //         }).catch(done);
    //
    //     });
    // });
    //
    //
    //
    //
    // it('Creates a student', function(done){
    //
    //     var student = new Student({
    //       name:"Ali Shosha",
    //       age: 20,
    //       email:"alisalix12@gmail.com",
    //       phone:"01027991356",
    //       address:"october",
    //       college:"Nile University",
    //       username:"alisshoshhaa",
    //       password:"hashedpassword"
    //     });
    //
    //     student.save().then(function(){
    //         assert(student.isNew ===false);
    //         done();
    //     }).catch(done);
    //
    // });
    //
    //
    //
    // it('Creates a session', function(done){
    //
    //   var session = new Session({
    //   });
    //
    //   Student.findOne({_id:"624ad999c2b4173f988a0944"}).then(function(result){
    //     Course.findOne({_id:"624ac86e63370d6d206b60a6"}).then(function(result2){
    //       Exam.findOne({_id:"624ad46494d8e03c950031ce"}).then(function(result3){
    //       session.student = result._id;
    //       session.course = result2._id;
    //       session.exam = result3._id;
    //       session.save().then(function(){
    //           assert(session.isNew ===false);
    //           done();
    //       }).catch(done);
    //     }).catch(done);
    //   });
    //   });
    // });
    //
    //
    //
    //
    //
    //
    //     it('Creates an exam review', function(done){
    //
    //       var examreview = new ExamReview({
    //         answers:["int","int","int","int","int","int","int","int"],
    //         no_of_correct:6,
    //         result:"passed"
    //       });
    //
    //       Student.findOne({_id:"624ad999c2b4173f988a0944"}).then(function(result){
    //         Exam.findOne({_id:"624ad46494d8e03c950031ce"}).then(function(result2){
    //           examreview.student = result._id;
    //           examreview.exam = result2._id;
    //           examreview.save().then(function(){
    //               assert(examreview.isNew ===false);
    //               done();
    //           }).catch(done);
    //         }).catch(done);
    //       });
    //     });

});
