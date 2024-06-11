import Mongoose from 'mongoose';
import Tour from './tourModel.js';

const reviewSchema = new Mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: Mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    // to show virtual fields which not in db but calculated by other fields can also show up
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //this.populate({
  //  path: 'tour',
  //  select: 'name',
  //}).populate({
  //  path: 'user',
  //  select: 'name photo',
  //});

  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

/*No next Needed: In post hooks, there's no need to call next because the operation has already been completed. 
The post hook cannot alter the operation; it can only execute code after the event has occurred.
*/
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

//QUERY MIDDLEWARE
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  //this.r = await this.findOne(); does not work here, query has already executed
  this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = Mongoose.model('Review', reviewSchema);
export default Review;
