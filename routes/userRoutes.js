import express from 'express';
import {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/userController.js';

import {
  protect,
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
  logout,
} from '../controllers/authController.js';

const userRouter = express.Router();

userRouter.route('/forgotPassword').post(forgotPassword);
userRouter.route('/resetPassword/:token').patch(resetPassword);
userRouter.post('/signup', signup);
userRouter.route('/login').post(login);
userRouter.route('/logout').get(logout);

// Protect all routes after this middleware
userRouter.use(protect);

userRouter.route('/updateMyPassword').patch(updatePassword);
userRouter.route('/updateMe').patch(uploadUserPhoto, resizeUserPhoto, updateMe);
userRouter.route('/deleteMe').delete(deleteMe);
userRouter.route('/me').get(getMe, getUser);

userRouter.use(restrictTo('admin'));

userRouter.route('/').get(getAllUser).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
