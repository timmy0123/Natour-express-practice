import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res, next) => {
  //1) Get tour data from collection
  const tours = await Tour.find();
  //2) Build template
  //3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour (including reviews and guides)
  //guides auto populate in tourSchema
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //2) Build template
  //3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

export const getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

export const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

export const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

export const getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
