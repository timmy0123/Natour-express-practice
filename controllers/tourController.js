//import fs from 'fs';
//import path from 'path';
//import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from './handlerFactory.js';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);
//const tours = JSON.parse(
//  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
//);

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

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

/* no imageCover only accept multiple images
upload.single('images')
upload.array('images', 5)
upload.array
*/

export const resizeToursImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  // forEach will not wait for each image => req.body.images still be empty
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});

export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//export const getAllTour = catchAsync(async (req, res, next) => {
//Build query
//1A) Filtering
//const queryObject = { ...req.query };
//const excludeFields = ['page', 'sort', 'limit', 'fields'];
//excludeFields.forEach((el) => delete queryObject[el]);

//1B) Advanced filtering
//let queryStr = JSON.stringify(queryObject);
//{duration: {$gte: 5}}
//{duration: {gte: 5}}
//gte,gt,lte,lt => add $ before gte,gt,lte,lt
//queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//let query = Tour.find(JSON.parse(queryStr));

//2) Sorting
//ascending: 1, descending: -1
//if (req.query.sort) {
//  const sortBy = req.query.sort.split(',').join(' ');
//  query = query.sort(sortBy);
//  // sort('price ratingsAverage') => sort ratingsAverage for equalprice
//} else {
//  query = query.sort('-createdAt');
//}

//3) Field limiting
//if (req.query.fields) {
//  const fields = req.query.fields.split(',').join(' ');
//  //projecting
//  query = query.select(fields);
//} else {
//  //removing __v
//  query = query.select('-__v');
//}

//4) Pagination
// *1 string => number
//const page = req.query.page * 1 || 1;
//const limit = req.query.limit * 1 || 100;
//const skip = (page - 1) * limit;

//if (req.query.page) {
//  const numTours = await Tour.countDocuments();
//  if (skip >= numTours) throw new Error('Page not found');
//}
////page=2&limit=10 => page1 1-10, page2 11-20 skip 1-10
//query = query.skip(skip).limit(limit);
//Execute query
//  const features = new APIFeatures(Tour.find(), req.query)
//    .filter()
//    .sort()
//    .limitFields()
//    .paginate();
//  const tours = await features.query;
//  res.status(200).json({
//    status: 'success',
//    results: tours.length,
//    data: {
//      //tours: tours
//      tours,
//    },
//  });
//});

export const getAllTour = getAll(Tour);
//export const getTour = catchAsync(async (req, res, next) => {
//  //populate will also create a new query
//  const tour = await Tour.findById(req.params.id).populate('reviews');
//  //Another way: Tour.findOne({_id: req.params.id})
//  if (!tour) {
//    return next(new AppError('No tour found with that ID'), 404);
//  }
//  res.status(200).json({
//    status: 'success',
//    data: {
//      tour,
//    },
//  });

//const id = req.params.id * 1;
//const tour = tours.find((el) => el.id === id);
//res.status(200).json({
//status: 'success',
//data: {
//  tour,
//},
//});
//});

export const getTour = getOne(Tour, { path: 'reviews' });

//export const createTour = catchAsync(async (req, res, next) => {
//const newTour = await Tour.create(req.body);
//
//res.status(201).json({
//  status: 'success',
//  data: {
//    tour: newTour,
//  },
//});

// use middleware to process body(json to js object)
//console.log(req.body);
//const newId = tours[tours.length - 1].id + 1;
//const newTour = Object.assign({ id: newId }, req.body);
//tours.push(newTour);
//fs.writeFile(
//  `${__dirname}/dev-data/data/tours-simple.json`,
//  JSON.stringify(tours),
//  (err) => {
//    // 200: ok
//    // 201: created
//    res.status(201).json({
//      status: 'success',
//      data: {
//        tour: newTour,
//      },
//    });
//  },
//);
//});

export const createTour = createOne(Tour);

//export const updateTour = catchAsync(async (req, res, next) => {
//  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//    new: true,
//    runValidators: true,
//  });
//  res.status(200).json({
//    status: 'success',
//    data: {
//      tour: tour,
//    },
//  });
//});

export const updateTour = updateOne(Tour);

//export const deleteTour = catchAsync(async (req, res, next) => {
//  const tour = await Tour.findByIdAndDelete(req.params.id);
//  if (!tour) {
//    return next(new AppError('No tour found with that ID', 404));
//  }
//  res.status(204).json({
//    status: 'success',
//    data: {
//      tour: null,
//    },
//  });
//});

export const deleteTour = deleteOne(Tour);

//export const checkId = (req, res, next, val) => {
//  if (req.params.id * 1 > tours.length) {
//    return res.status(404).json({
//      status: 'fail',
//      message: 'Invalid ID',
//    });
//  }
//  next();
//};

//export const checkBody = (req, res, next) => {
//  if (!req.body.name || !req.body.price) {
//    return res.status(400).json({
//      status: 'fail',
//      message: 'Missing name or price',
//    });
//  }
//  next();
//};

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //_id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    //{
    //  $match: { _id: { $ne: 'EASY' } }, // not equal to EASY
    //},
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // hide _id
      },
    },
    {
      $sort: { numTourStarts: -1 }, //1 asc -1 desc
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

/// /tours-within/:distance/center/:latlng/unit/:unit
/// /tours-within/233/center/34.111745,-118.113491/unit/mi
export const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //mi => miles, km => kilometers
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const distance = await Tour.aggregate([
    {
      // always be the first stage
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001,
      },
    },
    {
      $project: {
        // remove fields that we don't need
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distance,
    },
  });
});
