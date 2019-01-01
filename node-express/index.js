const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hostname = 'localhost';
const port = 3000;
const app = express();
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

app.use(morgan('dev'));

//parse the body of the incoming request and access it using req.body
app.use(bodyParser.json());

//mount the dishRouter to the app with endpoint: /dishes. Requests that comes
//to the /dishes endpoint will be handled by dishRouter
app.use('/dishes', dishRouter);

app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

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
