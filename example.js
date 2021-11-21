const { AuditLogBlockchain } = require('./chain.js');
const logger = require('elogger');
var cookieParser = require('cookie-parser');
var path = require('path');
const mongoose = require("mongoose");
var express = require('express');
// //  connect to database
// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/test_blockchain', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true
// });
var app = express();
//Variables
const port = process.env.PORT || 5006;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const mongouri = "mongodb+srv://ushan:ushan510@cluster0.ojvhn.mongodb.net/myFirstDatabase?retryWrites=true";
//mongoDB Connection
mongoose
  .connect(mongouri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    let blockChain = new AuditLogBlockchain();
    await blockChain.initialize();
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.log(err));

//adding a block
app.post("/blockchain/addBlock",async (req, res) => {
  const requestToken = req.body;
  let blockChain = new AuditLogBlockchain();
   
  let entry = await blockChain.createTransaction(req.body);
  console.log(req.body);
  res.send("Success");
});
//validate the blockchain
app.get("/blockchain/validate",async (req, res) => {
  let blockChain = new AuditLogBlockchain();
   
  let status = await blockChain.checkChainValidity();

  console.log(`Chain Status: ${(status)?'SUCCESS':'FAILED'}`);
  if (status) {
    res.send("Good");
  }else{
    res.send("Vulnerable");
  }
});

// (async() => {
//     let blockChain = new AuditLogBlockchain();
//     await blockChain.initialize();

//     for(let idx=1; idx <= 10; idx++) {
//         let payload = {
//             user: "1",
//             ip: '127.0.0.1',
//             user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97',
//             action: 'TEST_ACTION',
//             rtype: 'TEST',
//             ref_id: 'TEST_00' + idx,
//             created_on: new Date().getTime()
//         };
//         logger.info(`New Block Request: ${payload.ref_id}`);
//         let entry = await blockChain.createTransaction(payload);
//         logger.info(`New Transaction: ${entry.id}`);
//     }

//     let status = await blockChain.checkChainValidity();
//     logger.info(`Chain Status: ${(status)?'SUCCESS':'FAILED'}`);
//     process.exit(0);
// })();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, function () {
  console.log(`Server is running on port: ${port}`);
});

module.exports = app;