const mongoose = require('mongoose')
const dotenv = require("dotenv")

dotenv.config({path: '../config.env'})

const db = process.env.DATABASE

mongoose.connect(db).then(() => {
    console.log('Connected to database!')
}).catch((err) => {console.log('Unable to connect to database!')})