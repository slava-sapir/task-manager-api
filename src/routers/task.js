const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
      ...req.body,
      owner: req.user._id
  })

  try {
      await task.save()
      res.status(201).send(task)
  } catch (e) {
      res.status(400).send(e)
  }
})

// Return the task only for authenticated user
///GET /tasks?completed=true
//GET /tasks?limit=1&skip=2
//GET /tasks?sortBy=createdAt:desc

 router.get('/tasks', auth, async (req, res) => {
    try{
      // const tasks = await Task.find({owner: req.user._id})
      const match = {}
      const sort = {}
      if(req.query.completed){
       // match.completed = req.query.completed === 'true' 
       //equal to statement below
        match.completed = (req.query.completed === 'true') ? true : false
      }
      if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
      }
        const user = req.user
        await user.populate({
          path: 'tasks', 
          match,
          options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
          }
         }).execPopulate()
        res.status(200).send(user.tasks)
    } 
    catch(e) {
       res.status(500).send()
  }
 }) 

 router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
      const task = await Task.findOne({ _id, owner: req.user._id })

      if (!task) {
          return res.status(404).send()
      }

      res.send(task)
  } catch (e) {
      res.status(500).send()
  }
})


 router.patch('/tasks/:id', auth, async (req, res) => {
   // const _id = req.params.id
  //  const task_update = req.body
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
       if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
      }
   // try {
   //   const task = await Task.findByIdAndUpdate(_id, task_update, { new: true, runValidators:true })
   try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id })
        if(!task){
           res.status(404).send()
        }
        
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
       }
   catch(e){
        res.status(400).send(e)
       }
  })

  router.delete('/tasks/:id', auth, async(req, res) =>{
      try{
         const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id})
         if(!task){
            return res.status(404).send()
         }
          res.send(task)
      }
      catch {
         res.status(500).send()
      }
  })


module.exports = router