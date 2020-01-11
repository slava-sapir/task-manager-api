const { MongoClient, ObjectID } = require('mongodb') // destructuring below statement
//const MongoClient = mongodb.MongoClient

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect (connectionURL, { useUnifiedTopology: true }, (error, client) => {
  if(error){
      return console.log("0 -Unable connect to database")
  }
  const db = client.db(databaseName)
  db.collection('tasks').deleteMany({
        complete: false
    }).then((result) => {
               console.log(result)
    }).catch((error) => {
                console.log(error)
    })
    
  // db.collection('tasks').deleteOne({
  //     task: 'pre-code'
  // }).then((result) => {
  //            console.log(result)
  //      }).catch((error) => {
  //             console.log(error)
  // })
  
  // db.collection ('tasks').updateMany(
  //   {
  //       complete: true
  //   },
  //    {
  //      $set: {
  //             complete: false
  //            }
  //    }).then((result) => {
  //            console.log(result)
  //    }).catch((error) => {
  //           console.log(error)
  //    })

  // db.collection('tasks').updateOne({ 
  //   _id: new ObjectID("5de87f2eb66b45513c04e04b")
  //   }, [
 //      { $set: { task: 'pre-code' } },
  //     { $inc: { age: 1} }
  //      ]).then((result) => {
  //       console.log(result)
  //     }).catch((error) => {
  //       console.log(error)
  //     })
  
  //db.collection('tasks').findOne({ task: 'code', description: 'write some code'}, (error, task) => {
 
 /* db.collection('tasks').insertMany([
      {
        task: "logic",
        descption: "write some logic"
      },
      {
       task: "code",
       descption: "write some code"
     },
     {
       task: "test",
       descption: "test your code"
     },
     {
       task: "deploy",
       descption: "deploy your code"
     }
     ], (error, result) => {
          */
   //    if(error){
   //        return console.log('1 -Unable to connect to database!')
   //    }
    
   //    console.log(task)
   // })  
    
    //db.collection('tasks').find({ task:'test'}).toArray((error, task) =>{
     //   console.log(task)
   // })
})