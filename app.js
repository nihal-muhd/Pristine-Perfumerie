const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs= require('express-handlebars')  
const db=require('./config/connection') 
const session=require('express-session')


const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs.engine({helpers:{inc:function(value,options){return parseInt(value)+1;}},extname:'hbs',defaultLayout:'user-layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/', runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true,},}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
  res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  next();
})



app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie:{maxAge:600000}
}))


db.connect((err)=>{  // here we are calling db.connect
  if(err) console.log("Connection Error"+err);
  else console.log("Sucessfully connected to Database of port 27017");
  })
           

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
  res.render('user/error');
});

module.exports = app;
