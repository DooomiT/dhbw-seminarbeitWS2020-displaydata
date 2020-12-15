// simple node.js application to receive data  from eventbus store the data in memory
//   and on get request print the data to console.log


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const MessurementM = require('./MessurementDataModel.js').MessurementM;
const app = express();
app.use(bodyParser.json());
app.use(cors());

const measurements = {};

// dynamic endpoints & other values
const db_user = process.env.MONGO_USERNAME;
const db_password = process.env.MONGO_PASSWORD;
var db_name = "co2Ampel"
var db_hostname = "localhost"
var db_port = 27017
if(process.env.MONGO_DATABASE){
  db_name = process.env.MONGO_DATABASE;
}
if(process.env.MONGO_HOSTNAME){
  db_hostname = process.env.MONGO_HOSTNAME;
}
if(process.env.MONGO_PORT){
  db_port = process.env.MONGO_PORT;
}

const mongo_uri = "mongodb://" + db_hostname + ":" + db_port + "/" + db_name;
mongoose.connect(mongo_uri, {
  authSource: db_name,
  user: db_user,
  pass: db_password, 
  useCreateIndex: true,
  useNewUrlParser: true, 
  useUnifiedTopology: true
});
const db = mongoose.connection; 

// get request received - print the measurement data to console log and return it to requester
app.get('/data',(req,res)=> {
  db.on('error', console.error.bind(console, 'connection error:')); 
  db.once('open', function() { 
    console.log("connected to database");
    MessurementM.find()
      .then((messurementData) => res.status(200).send(messurementData))
      .catch((err) => res.status(400).send(err));
  });
}); 

// post event is received from eventbus - so put the data into memory
app.post('/events',(req,res)=> {
  const { type, measurementdata } = req.body;
  const { id, data } = measurementdata;

  // save data in database
  db.on('error', console.error.bind(console, 'connection error:'));
  console.log("connected to database");
  const messurementM = new MessurementM({
    id: id,
    data: data,
  });
  messurementM.save(function(err, messM) {
    if(err) {
        console.log(err);
        return res.status(500).send(); 
    }     
  });
  res.send({});
});

app.listen(4001, () => {
    console.log('Listening on 4001');
});