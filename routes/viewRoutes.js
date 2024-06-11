import express from 'express';
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
  alerts,
} from '../controllers/viewController.js';
//import { createBookingCheckout } from '../controllers/bookingController.js';
import { isLoggedIn, protect } from '../controllers/authController.js';

const viewRoute = express.Router();

viewRoute.use(alerts);

//viewRoute.get('/', createBookingCheckout, isLoggedIn, getOverview);
viewRoute.get('/', isLoggedIn, getOverview);
viewRoute.get('/tour/:slug', isLoggedIn, getTour);
viewRoute.get('/login', isLoggedIn, getLoginForm);
viewRoute.get('/me', protect, getAccount);
viewRoute.get('/my-tours', protect, getMyTours);

viewRoute.post('/submit-user-data', protect, updateUserData);

export default viewRoute;
