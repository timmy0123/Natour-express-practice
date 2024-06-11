import express from 'express';
import {
  getCheckoutSession,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../controllers/authController.js';

// Nested route get tourId from parent route
const bookingRoute = express.Router();

bookingRoute.use(protect);
bookingRoute.get('/checkout-session/:tourId', getCheckoutSession);
bookingRoute.use(restrictTo('admin', 'lead-guide'));
bookingRoute.route('/').get(getAllBookings).post(createBooking);
bookingRoute
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

export default bookingRoute;
