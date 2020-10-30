var express = require('express'); //imports express js
var bodyParser = require('body-parser'); //enable the express app to read the incoming body
var logger = require('morgan'); //for logging all http request 
var methodOverride = require('method-override') //allows to use put and delete request
var cors = require('cors'); //cross origin resource sharing enables ionic to communicate with serve
var nodemailer = require("nodemailer");
var addRequestId = require('express-request-id')();
var app = express()
app.use(methodOverride());
var responseTime = require('response-time')
var MongoClient = require('mongodb').MongoClient;
const NodeCache = require("node-cache");
app.use(cors());
var path = require("path");
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
var jwt = require('jsonwebtoken');
var secret = require('./secret');
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(addRequestId);

var Bcrypt = require('bcrypt');
var router = express.Router();
app.use(responseTime());


app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
})

var displayevents = require('./models/events/displayevents');
app.route('/displayevents').post(displayevents);
app.get('/',(req,res)=>{
  res.json({
    "User":"Staging",
    "Success":true
  })
})
var option = {
    poolSize: 100,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  
  MongoClient.connect(`mongodb://staging:${encodeURIComponent('staging@grapido123')}@35.200.245.53/staging`, option)
    .then(client => {
      const db = client.db('staging');
      const myCache = new NodeCache({
        stdTTL: 0,
        checkperiod: 300
      });
      console.log("db_connected");
      app.locals.db = db;
      app.locals.myCache = myCache;
      db.collection('users').find({}).toArray((err, result) => {
        var registeredEmail = result.map(obj => obj.Email);
        var registeredUsername = result.map(obj => obj.Username);
        var registeredMobile = result.map(obj => obj.Mobile);
        myCache.set("registeredEmail", registeredEmail);
        myCache.set("registeredUsername", registeredUsername);
        myCache.set("registeredMobile", registeredMobile);
  })
     
      var port = process.env.PORT || 8080;
      app.listen(port, () => console.info(`REST API running on port ${port}`));
    }).catch(error => console.error(error));
  
  // app.listen(process.env.PORT || 8080);
  console.log("Routed")