var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socketio = require('socket.io');
var http = require('http');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const server = http.createServer(app);
const io = socketio(server);

//databases;
const pool = require('../db/pool');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  next();
})
app.use('/', indexRouter);
app.use('/users', usersRouter);
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

module.exports = { app: app, server: server };

////////////////
////////////////
/////////////////
//ここから対局処理
let peopleCount = 0;
let waiting = [];
io.on("connection", (socket) => {
  peopleCount++;
  io.emit("peopleCount", (peopleCount));
  socket.on("waiting", () => {
    waiting.push(socket.id);
  })
  socket.on("putKoma", (info) => {
    io.to(info.id).emit("komaPut", (info.place));
  })
  socket.on("pass", (id) => {
    io.to(id).emit("passed");
  })
  socket.on("stopWaiting", () => {
    for (let f = 0; f < waiting.length; f++) {
      if(socket.id == waiting[f] ) {
        waiting.splice(f, 1);
      }
    }
    console.log(waiting)
  })
  socket.on("disconnect", () => {
    peopleCount--;
    io.emit("peopleCount", (peopleCount));
  })
})
setInterval(() => {
  matching();
}, 5000);

function matching() {
  while(waiting.length > 1) {
    let first = Math.floor(Math.random() * waiting.length);
    let last = Math.floor(Math.random() * waiting.length);
    while(first == last) {
      last = Math.floor(Math.random() * waiting.length);
    }
    sendId(first, last);
    waiting.splice(first, 1);
    if(first < last) {
      waiting.splice(last - 1, 1);
    } else {
      waiting.splice(last, 1);
    }
    
  }
}
function sendId(f, l) {
  io.to(waiting[f]).emit("gameStart", (waiting[l]));
  io.to(waiting[f]).emit("gameStartS", ("0"));
  io.to(waiting[l]).emit("gameStart", (waiting[f]));
  io.to(waiting[l]).emit("gameStartS", ("1"));
}