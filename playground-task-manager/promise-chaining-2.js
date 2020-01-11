require('../../task-manager/src/db/mongoose')
const Task = require('../../task-manager/src/models/task')

//Transformation from Promise function to async-await function
// Task.findByIdAndRemove('5ded95794d513a57d4aee0d4').then((task) =>{
//     console.log(task)
//     return Task.countDocuments({completed: true})
// }).then((result) =>{
//     console.log(result)
// }).catch((e) =>{
//     console.log(e)
// })

const deleteTaskAndCount = async(id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed: false})
    return count
}

deleteTaskAndCount('5ded40f2a9e72e3094aa4f42').then((count) => {
    console.log(count)
}).catch((e) =>{
    console.log(e)
})