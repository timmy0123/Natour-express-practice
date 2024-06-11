import Mongoose from 'mongoose';

const bookingSchema = new Mongoose.Schema(
  {
    tour: {
      type: Mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a tour.'],
    },
    user: {
      type: Mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user.'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = Mongoose.model('Booking', bookingSchema);
export default Booking;
