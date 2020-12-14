// simple node.js application to receive data  from eventbus store the data in memory
//   and on get request print the data to console.log


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
app.use(bodyParser.json());
app.use(cors());

const measurements = {};

// dynamic endpoints & other values
const db_user = process.env.MONGO_USERNAME;
const db_password = process.env.MONGO_PASSWORD;
const db_name = process.env.MONGO_DATABASE;
const db_port = process.env.MONGO_PORT;
const db_hostname = process.env.MONGO_HOSTNAME; 
const event_bus_endpoint = process.env.EVENT_BUS_ENDPOINT;
mongo_uri  = ""
if (db_user != ""){
  mongo_uri += "mongodb://" + db_user + ":" + db_password + "@" + db_hostname + ":" + db_port;
}
else{
  mongo_uri += "mongodb://" + db_hostname + ":" + db_port;
}
const MessurementM = require('./MessurementDataModel.js').MessurementM;

mongoose.connect(mongo_uri, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
  console.log("connected to mongo db");
});
// get request received - print the measurement data to console log and return it to requester
app.get('/data',(req,res)=> {
    console.log(measurements);
    res.send(measurements);
}); 

// post event is received from eventbus - so put the data into memory
app.post('/events',(req,res)=> {
  const { type, measurementdata } = req.body;

  console.log(type); 
  console.log(measurementdata);
  const { id, data } = measurementdata;
  console.log(typeof(data));

  // save data in memory
  measurements[id] = { id, data };

  // save data in database
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
    console.log(db_user, db_password, db_name, db_port, db_hostname, event_bus_endpoint);
    console.log('Listening on 4001');
});