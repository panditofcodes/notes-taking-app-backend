const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')


dotenv.config({ path: './config.env'})
require('./Database/db')

app.use(express.json())
//const User = require('../Model/userSchema')

app.use(require('./router/routes'))
const PORT = process.env.PORT || 8080

app.get('/home',(req,res) => {
    res.send('Hello from home')
} )
app.get('/addnote',(req,res) => {
    res.send('Hello from addnote')
} )
app.get('/savednote',(req,res) => {
    res.send('Hello from savednote')
} )
app.get('/deletednote',(req,res) => {
    res.send('Hello from deletednote')
} )

// if (process.env.NODE_ENV == "production") {
//     app.use(express.static("client/build"))
// }

app.listen(PORT,()=>{
    console.log('Working!')
})