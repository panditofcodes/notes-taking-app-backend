const mongoose = require("mongoose");

const notesBodySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  notepad: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Bin = mongoose.model("Bin", notesBodySchema);

module.exports = Bin;
