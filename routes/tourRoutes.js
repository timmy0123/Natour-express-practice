import express from 'express';
import {
  getAllTour,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeToursImages,
} from '../controllers/tourController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import reviewRoute from './reviewRoutes.js';

const tourRouter = express.Router();
//tourRouter.param('id', checkId);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTour);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);
tourRouter
  .route('/')
  .get(getAllTour)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeToursImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

//tourRouter
//  .route('/:tourId/reviews')
//  .post(protect, restrictTo('user'), createNewReviews);

tourRouter.use('/:tourId/reviews', reviewRoute);
export default tourRouter;
