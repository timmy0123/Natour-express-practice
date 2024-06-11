import Mongoose from 'mongoose';
import slugify from 'slugify';
//import User from './userModel.js';
//import validator from 'validator';

const tourSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation => NOT on update
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // remove white space at the beginning and end of the string
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false, => hide this field from query
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: Mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 1: ascending -1: descending
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//virtual field not save in database but only in memory or calculated from other field
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
//Not build a array of child reference in tour instead build a virtual field
tourSchema.virtual('reviews', {
  ref: 'Review',
  //parent reference => tour in review model
  foreignField: 'tour',
  //tour id
  localField: '_id',
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Embedding guides in tour
//tourSchema.pre('save', async function (next) {
//  //guidesPromises => array of promises
//  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//  this.guides = await Promise.all(guidesPromises);
//  next();
//});

//run after .save() and .create()
//tourSchema.post('save', function(doc, next) {
//  console.log(doc);
//  next();
//});

//QUERY MIDDLEWARE
//tourSchema.pre('find' ...
// all the string start with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
//tourSchema.pre('aggregate', function (next) {
//  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // shift end of the pipeline array, unshift beginning of the array
//  next();
//});

const Tour = Mongoose.model('Tour', tourSchema);
export default Tour;
