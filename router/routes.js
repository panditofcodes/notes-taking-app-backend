const express = require("express");
const router = express.Router();
require("../database/db");
const User = require("../models/userSchema");
const savedNotes = require("../models/savedNote")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate')
const cookieParser = require('cookie-parser');
const bin = require("../models/bin");

router.use(cookieParser())

router.get("/", (req, res) => {
  res.send("Hello from router server");
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({ error: "Please fill up details!" });
  }
  try {
    let token;
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: "User Already Exist!" });
    }

    const user = new User({ name, email, password });

    await user.save();

    res.status(201).json({ message: "User Registered!" });
  } catch (err) {
    console.log(err);
  }
});
router.post("/signin", async (req, res) => {
  //console.log(req.body)
  // res.json({message:"Working"})

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Invalid Credential!" });
    }

    const userLoginEmail = await User.findOne({ email: email });

    if (userLoginEmail) {
      const isMatch = await bcrypt.compare(password, userLoginEmail.password);
      const token = await userLoginEmail.generateAuthToken()
      
      console.log(token)

      res.cookie("jwtToken", token, {
        expires:new Date(Date.now() + 25892000000),
        httpOnly:true
      })
      if (!isMatch) {
        res.status(401).json({ error: "Unauthorized Access!" }); //email not found
      } else {
        res.status(200).json({ message: "Logged In!" });
      }
    } else {
        res.status(404).json({ error: "User Not Found." });//wrong password
      }
  } catch (err) {
    console.log(err);
  }
});

router.post("/saveNotes", authenticate, async (req, res) => {

  const token = req.cookies.jwtToken;
  const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
  const rootUser = await User.findOne({ _id:verifyToken.id, "tokens.token":token});
  const email = rootUser.email
  const {title, notepad} = req.body

  if (!title || !notepad) {
    return res.status(422).json({ error: "Please fill up details!" });
  }

  try {
    const note = new savedNotes({ title, notepad,email});
    await note.save();
    res.status(201).json({ message: "Note Saved!" });
  } catch (err) {
    console.log(err)
  }

});

router.get("/getData", authenticate, (req,res)=>{
  // console.log('Sending Data!')
  res.send(req.rootUser)
})

router.get("/savedNote",async (req,res)=>{
  const token = req.cookies.jwtToken;
  if(!token){
    return res.status(401).json({ error: 'JWT must be provided' });
  }
  const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
  const rootUser = await User.findOne({ _id:verifyToken.id, "tokens.token":token});
  const email = rootUser.email
  const notes = await savedNotes.find({email}).sort({ createdAt: -1 });
  res.send(notes)
})

router.get("/deletedNotes", async (req,res)=>{
  const token = req.cookies.jwtToken;
  if(!token){
    return res.status(401).json({ error: 'JWT must be provided' });
  }
  const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
  const rootUser = await User.findOne({ _id:verifyToken.id, "tokens.token":token});
  const email = rootUser.email
  const notes = await bin.find({email}).sort({ createdAt: -1 });
  res.send(notes)
})



router.post("/temp",(req,res)=>{
  const data = req.body
  console.log(data)
  res.json({msg: "working"})
})
router.get("/showNote/:noteId", async (req, res) => {
  try {
    // Retrieve the 'noteId' from the query parameters
    const noteId = req.params.noteId;

    const note = await savedNotes.find({_id:noteId})

    res.send(note); // Replace this line with the appropriate response
  } catch (error) {
    // Handle any errors that occur during fetching the note
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.delete("/deleteNote/:noteId", async (req, res) => {

  const noteId = req.params.noteId;

  if(noteId){
    try {
      const avl_note = await savedNotes.findOne({_id:noteId})
      if (avl_note) {
        await savedNotes.deleteOne({ _id: noteId });
  
        // If the note was successfully deleted from the database, send a success response
        res.status(204).json({ message: "Note deleted successfully." });
      } else {
        await bin.deleteOne({ _id: noteId });
  
        // If the note was successfully deleted from the database, send a success response
        res.status(204).json({ message: "Note deleted successfully." });
      }
     
    } catch (error) {
      // Handle any errors that may occur during the deletion process
      res.status(500).json({ message: "Failed to delete the note.", error: error.message });
    }
  } else(
    res.status(404).send("No Id Found!")
  )

  
});

// router.post("/moveToBin/:noteId", async (req,res)=>{
//   const noteId = req.params.noteId 
//   if(noteId){
    
//   } else {
//     res.status(500).send("Internal Server Error!")
//   }
// })

router.post("/move/:noteId",async (req,res)=>{
  const noteId = req.params.noteId 
  if(noteId){

    const note = await bin.findOne({_id:noteId})

    if (note) {
      try {
        // const note = await deletedNote.findOne({_id:noteId})
        if(note){
          const {email, title, notepad} = note
  
          const binNote = new savedNotes({title, notepad,email})
          binNote.save()
  
          await bin.deleteOne({_id:noteId})
          res.status(200).send("Working!")
        } else{
          res.status(404).send("Note note found")
        }
      } catch (err) {
        console.log(err)
      }
    } else {
      try {
      
        const note = await savedNotes.findOne({_id:noteId})
        if(note){
          const {email, title, notepad} = note
  
          const binNote = new bin({title, notepad,email})
          binNote.save()
  
          await savedNotes.deleteOne({_id:noteId})
          res.status(200).send("Working!")
        } else{
          res.status(404).send("Note note found")
        }
      } catch (err) {
        console.log(err)
      }
    }
  } else {
    res.status(500).send("Internal Server Error!")
  }
})

router.patch("/updateNote/:noteId", async (req,res)=>{

  const noteId = req.params.noteId
  const { modelNotepad } = req.body
  console.log(req.body)

  if (noteId) {
    try {
      const updatedNote = await savedNotes.findOneAndUpdate(
        { _id: noteId },
        { $set: { notepad: modelNotepad } }, // Update the notepad field
        { new: true }
      );
      console.log(updatedNote)
      res.status(200).send(updatedNote)
    } catch (err) {
      res.status(500).send("Internal server error!")
    }
  } else {
    res.status(404).send("Note not found!")
  }
})

router.get("/logout",(req,res)=>{
  res.clearCookie('jwtToken')
  
  res.status(200).send('User Logged Out!')
  })

module.exports = router;
