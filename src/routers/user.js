const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const router = new express.Router()

//The functions below we can break down as router and controller
//router.post('/user/login', login_controller_post)
//login_controller is actually function that below which 
//renders some sort of template as: res.render('user-login',{user, token})
//router.get('/user/login',login_controller_get) render form (pug)-> 
//user fills the form -> then user submit the form:router.post('/user/login', login_controller_post)

router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

router.post('/users', async (req, res) => {
    const user = new User(req.body);
	// res.header("access-control-allow-origin", "*");
    // res.header("access-control-allow-headers", "x-requested-with");

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
        //req.cookies('tokenKey', token)- set up header before sending to the server
        //res.cookie('tokenKey', token - another approach to send token to client using cookies)
        //or is the way to send with authorization header:
//   var rp = require('request-promise');
//   options = {
//   method: GET,
//   uri: 'https://www.example.com/api/sample',
//   headers: {
//     Authorization: "Bearer <insert_your_JWT_here>"
//     }
//   }
//   rp(options).then(function(res){
//    <handle_response>
//  }
        console.log(user, token)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
   //controller
   try {
        const user = await User.findByCredentials(req.body.email, req.body.password) 
        const token = await user.generateAuthToken()
        res.send({user,token})
     }
   catch(e) {
        res.status(400).send(e)
   }
    
})

router.post('/unique', async (req, res) => {
   //controller
   try {
        const user = await User.findOne("name": req.body.name) 
        res.status(201).send({user});
     }
   catch(e) {
        res.status(400).send(e)
   }
    
})


router.post('/users/logout', auth, async (req, res) => {
    try {
      
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()

    } catch(e) {
		
        res.status(500).send()
    }

})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        // Different ways to wipe out data from array of tokens
        // req.user.tokens = req.user.tokens.filter((token) => {
        //     return token.token === req.token
        // })
        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch(e) {
        res.status(500).send()
    }

})
 


router.get('/users/me', auth, async (req, res) => {
         res.send(req.user)
})

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {

//         res.status(500).send()
//     }
// })

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        //const user = await User.findById(req.params.id)
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        //changes to delete authenticated user
        // const user = await User.findByIdAndDelete(req.params.id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//file uplpoad and validation
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file,cb){
          if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload jpg|jpeg|png file!'))
        }
        cb(undefined, true)
    }
 })


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize( { width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
         const user = await User.findById(req.params.id)
         if(!user || !user.avatar){
             throw new Error()
         }
          res.set('Content-Type', 'image/png')
          res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports = router