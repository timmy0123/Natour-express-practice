import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import { webhookCheckout } from './controllers/bookingController.js';
import AppError from './utils/appError.js';
import errorController from './controllers/errorController.js';
import viewRoute from './routes/viewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.enable('trust proxy');

// Implementing CORS
app.use(cors());

// Access-Control-Allow-Origin *
// api.natours.com, natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

// simple request get, post
// allow none simple requests like patch, delete
app.options('*', cors());
// only on specific route
// app.options('/api/v1/tours/:id', cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// 1) GLOBAL MIDDLEWARES
//console.log(process.env.NODE_ENV);

//set security HTTP headers
app.use(helmet());

// Set the CSP headers

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/',
  'https://*.stripe.com',
  'https:',
  'data:',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
  'https:',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com/',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'ws://localhost:59067/',
  'wss://*.cloudflare.com/',
  'ws://127.0.0.1:59067/',
];
const fontSrcUrls = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'https:',
  'data:',
];
const frameSrcUrls = ['https://*.stripe.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      baseUri: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'data:', 'blob:'],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      childSrc: ["'self'", 'blob:'],
      frameSrc: ["'self'", ...frameSrcUrls],
      upgradeInsecureRequests: [],
    },
  }),
);

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(compression());

// the stripe should read body in row not json
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout,
);

//set body parser, read data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection => filter out malicious queries like $
app.use(ExpressMongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution => only use last one of same parameter is duplicated
app.use(
  hpp({
    // allow duplicate fields
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//set limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//app.use((req, res, next) => {
//  console.log('Hello from the middleware');
//  next();
//});

// test middleware
app.use((req, res, next) => {
  // add a request time to request object
  req.requestTime = new Date().toISOString();
  next();
});

// 2) Route handlers
/*
const getAllTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    time: req.requestTime,
    results: tours.length,
    data: {
      //tours: tours
      tours,
    },
  });
};
const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};
const createTour = (req, res) => {
  // use middleware to process body(json to js object)
  //console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // 200: ok
      // 201: created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};
const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour...>',
    },
  });
};
const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
*/

//app.get('/api/v1/tours', getAllTour);
//app.get('/api/v1/tours/:id', getTour);
//app.post('/api/v1/tours', createTour);
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
/*
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTour).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUser).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
*/

app.use('/', viewRoute);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  //res.status(404).json({
  //  status: 'fail',
  //  message: `Can't find ${req.originalUrl} on this server!`,
  //});

  //const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  //err.status = 'fail';
  //err.statusCode = 404;
  //next(err);

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

// 4) START SERVER
/*
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
*/
export default app;
