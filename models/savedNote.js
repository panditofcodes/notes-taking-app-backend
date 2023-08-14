const mongooose = require("mongoose");

const notesBody = new mongooose.Schema({
  email:{
    type: String,
    required: true,
   },
    title:{
        type: String,
        required: true,
 },
   notepad:{
        type: String,
        required: true,
   }
  },
  {
    timestamps:true
  },

)

const savedNotes = mongooose.model("SAVEDNOTES", notesBody );

module.exports = savedNotes;
