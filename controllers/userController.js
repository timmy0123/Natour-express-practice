import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

//const multerStorage = multer.diskStorage({
//  destination: (req, file, cb) => {
//    cb(null, 'public/img/users');
//  },
//
//  filename: (req, file, cb) => {
//    const ext = file.mimetype.split('/')[1];
//    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//  },
//});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//export const getAllUser = catchAsync(async (req, res, next) => {
//  const tours = await User.find();
//  res.status(200).json({
//    status: 'success',
//    results: tours.length,
//    data: {
//      //tours: tours
//      tours,
//    },
//  });
//});

export const getAllUser = getAll(User);

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  // 2) Filter out unwanted fields names that are not allowed to be updated
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  // 3) Update user document
  // use findByIdAndUpdate to disable validators
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getUser = getOne(User);

export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Please use signup instead',
  });
};

// Do Not update passwords with this!
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
