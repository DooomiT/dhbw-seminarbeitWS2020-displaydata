const mongoose = require('mongoose');

const MessurementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  }
});

const MessurementM = mongoose.model('MessurementM', MessurementSchema)

module.exports = { MessurementM };