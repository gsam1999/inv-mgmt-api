var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');

var itemRouter = require('./routes/items');
var userRouter = require('./routes/users');

var app = express();

const mongoose = require('mongoose');
const uri = "mongodb+srv://admin:admin@cluster0.vtf4u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to DB"))
  .catch(console.error);

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next()
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
  }
})

const cors = require('cors');
app.use(cors());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));


// router.get('/', function (req, res, next) {
//   res.sendFile(path.join(__dirname, '/index.html'));
// });


// app.use('/', router)
app.use('/users', userRouter);
app.use('/items', itemRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
