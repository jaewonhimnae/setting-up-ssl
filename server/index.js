const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/key');

const app = express();

//////////////////////////////////////////START FOR HTTPS  ///////////////////////////////////////////// 
const https = require('https');
const fs = require('fs');
// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/johnahn7.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/johnahn7.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/johnahn7.com/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

//Create http server with certificate credentials
const https_server = https.createServer(credentials, app);
////////////////////////////////////////////////// HTTPS  ///////////////////////////////////////////////// 


mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

// Helmet helps you secure your Express apps by setting various HTTP headers. 
app.use(helmet())

// Logger Middleware
app.use(morgan('dev'));

// CORS Middleware
app.use(cors());

app.use('/api/users', require('./routes/users'));

//use this to show static files you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/uploads', express.static('uploads'));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {

  // Set static folder
  // All the javascript and css files will be read and served from this folder
  app.use(express.static("client/build"));

  // index.html for all page routes  html or routing and naviagtion
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000


// app.listen(port, () => {
//   console.log(`Server Running at ${port}`)
// });

https_server.listen('8443', () => {
  console.log("Https Server Running at 8443")
})
