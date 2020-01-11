const mongoose = require('mongoose')

// mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
//   useCreateIndex: true  
// })

mongoose.connect(process.env.MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true  
})

   