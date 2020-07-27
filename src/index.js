const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()

app.use(express.json())
//to add middleware below: git push heroku master
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(userRouter)
app.use(taskRouter)

module.exports = app