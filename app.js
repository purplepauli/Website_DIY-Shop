const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon');

// router
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const paymentRouter = require('./routes/payment');
const productRouter = require('./routes/products');
const guidesRouter = require('./routes/guides');
const safetyRouter = require('./routes/ratgeber');
const searchRouter = require('./routes/search');

// employee only
const dashboardRouter = require('./routes/employeeOnly/dashboard');
const actionsRouter = require('./routes/employeeOnly/actions');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Middleware für das Favicon definieren
app.use(favicon(path.join(__dirname, 'public', 'images', 'Favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));

// Stellt currentPath (z.B. "/produkte") und currentCategory (z.B. "Renovierung")
// in res.locals bereit, damit das Nav im Header den aktiven Eintrag hervorheben kann.
app.use(function (req, res, next) {
    res.locals.currentPath = req.path;
    res.locals.currentCategory = req.query.category || null;
    res.locals.currentSubcategory = req.query.subcategory || null;
    next();
});

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/bezahlen', paymentRouter);
app.use('/produkte', productRouter);
app.use('/guides', guidesRouter);
app.use('/ratgeber', safetyRouter);
app.use('/suche', searchRouter);

//employee only
app.use('/mitarbeiter/dashboard', dashboardRouter);
app.use('/mitarbeiter/actions', actionsRouter);

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
