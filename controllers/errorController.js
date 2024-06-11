import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // use Object.values to loop through all errors
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Api
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // render website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrProduction = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: don't leak error details
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // render website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};
const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500: internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrProduction(error, req, res);
  }
};

export default errorController;

/*
let error = {...err} => error.name == undefined

The first code snippet you provided is using object spread syntax to create a new object error with all the properties of err. 
However, the spread syntax does not copy the prototype of the object, so the name property is not copied.

The second code snippet you provided is using the Object.assign() method to create a new object error with all the properties of err. 
This method does copy the prototype of the object, so the name property should be copied as well.

Both approaches should work to create a new object error with all the properties of err, including the name property.
*/
