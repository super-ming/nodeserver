const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hostname = 'localhost';
const port = 3000;
const app = express();

app.use(morgan('dev'));

//parse the body of the incoming request and access it using req.body
app.use(bodyParser.json());

//for all requests for the dishes endpoint, set a default response, then step into
//the detailed CRUD method
app.all('/dishes', (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-type', 'text/plain');
  next();
});

app.get('/dishes/', (req, res, next) => {
  res.end('Will send all the dishes to you!');
})

app.post('/dishes', (req, res, next) => {
  res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
})

app.put('/dishes', (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes');
})

app.delete('/dishes', (req, res, next) => {
  res.end('Deleting all the dishes!');
})

//get the specific dishId parameter from req.params
app.get('/dishes/:dishId', (req, res, next) => {
  res.end('Will send details of the dish: ' + req.params.dishId + ' to you!');
})

app.post('/dishes/:dishId', (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/' + req.params.dishId);
})

app.put('/dishes/:dishId', (req, res, next) => {
  res.write('Updating the dish: ' + req.params.dishId + '\n');
  res.end('Will update the dish: ' + req.body.name + ' with details: ' + req.body.description);
})

app.delete('/dishes/:dishId', (req, res, next) => {
  res.end('Deleting dish: ' + + req.params.dishId);
})

//serve files in the public folder in the root directory
app.use(express.static(__dirname + '/public'));
//serve a default response outside of the static path above
app.use((req, res, next) => {
  res.statusCode= 200;
  res.setHeader('Content-type', 'text/html')
  res.end('<html><body><h1>This is an Express server</h1></body></html>')
});
const server = http.createServer(app);
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`)
})
