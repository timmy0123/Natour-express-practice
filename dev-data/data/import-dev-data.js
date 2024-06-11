import dotenv from 'dotenv';
import Mongoose from 'mongoose';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import Tour from '../../models/tourModel.js';
import User from '../../models/userModel.js';
import Review from '../../models/reviewModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

//Import Data into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('success import');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Delete All Data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('success delete');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
