const express = require('express');
const http = require('http');
const morgan = require('morgan');
const hostname = 'localhost';
const port = 3000;
const app = express();

app.use(morgan('dev'));
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
