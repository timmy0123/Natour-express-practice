import express from 'express';
import {
  getAllReviews,
  getReview,
  createNewReviews,
  deleteReview,
  setToursUserIds,
  updateReview,
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../controllers/authController.js';

// Nested route get tourId from parent route
const reviewRoute = express.Router({ mergeParams: true });

reviewRoute.use(protect);
//start with /api/v1/tours/:tourId/reviews
reviewRoute
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setToursUserIds, createNewReviews);

reviewRoute
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .get(getReview);

export default reviewRoute;
