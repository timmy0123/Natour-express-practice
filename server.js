import dotenv from 'dotenv';
import Mongoose from 'mongoose';

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<MONGODB_PASSWORD>',
  process.env.MONGODB_PASSWORD,
);
Mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(() => {
  console.log('DB connection successful!');
});

import('./app.js').then((module) => {
  const port = process.env.PORT || 3000;
  const app = module.default; // Access the default export from the module
  const server = app.listen(port, () =>
    console.log(`Server running on port ${port}`),
  );

  process.on('unhandledRejection', (err) => {
    console.log(err);
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    // wait for the server to handle the pending request
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
});
