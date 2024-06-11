const catchAsync = (fn) => (req, res, next) => {
  // fn returns promise
  fn(req, res, next).catch((err) => next(err));
};

export default catchAsync;
