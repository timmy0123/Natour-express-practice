import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// middleware: modify incomine data
app.use(express.json());
//app.get('/', (req, res) => {
//  res.status(200).json({
//    message: 'Hello from the server side!',
//    app: 'Natours',
//  });
//});
//
//app.post('/', (req, res) => {
//  res.status(200).send('You can post to this endpoint...');
//});

//__dirname is not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//specify api version: v1, can create new version in future and still remain v1 for user who is still using it
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      //tours: tours
      tours,
    },
  });
});
///api/v1/tours/:id/:x/:y? =>? optional
app.get('/api/v1/tours/:id', (req, res) => {
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
});

// CRUD url should be same on change http method !
app.post('/api/v1/tours', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
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
});

app.delete('/api/v1/tours/:id', (req, res) => {
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
});
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
