const mongoose = require('mongoose');

mongoose.Promise = global.Promise


// connect to db before any tests run
before(function(done){
  //connect to mongo :
  mongoose.connect("mongodb://localhost/test_orange");
  mongoose.connection.once('open',function(){
      console.log('connection has been made');
      done();
  }).on('error',function(error){
    console.log('connection error',error);
  });

});
