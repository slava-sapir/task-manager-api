const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const router = new express.Router()

router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE,PUT");
    next()
  });

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
		
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
		
        } catch (e) {
        res.status(400).send(e)
    }
})

// new authCheck if user signed up
router.get('/users/signedin', async (req, res) => {
 try {
	 
	     if(req.header('Authorization')){
            const token = req.header('Authorization').replace('Bearer ', '')
		    const decoded = jwt.verify(token, process.env.SECRET_KEY)
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
            res.status(201).send({ authenticated: true, name: user.name })
		 }
		
		 else res.status(200).send({ authenticated: false, name: null })
          

    } catch (e) {
        res.status(200).send(e)
    }	
})	

router.post('/users/login', async (req, res) => {

   try {
        const user = await User.findByCredentials(req.body.email, req.body.password) 
		
		if (user){
		  const token = await user.generateAuthToken()
		  res.status(201).send({user,token})
		} 
			
     } catch(e) {
        res.status(400).send(e)
     }
    
})

router.post('/unique', async (req, res) => {
   
   try {
        const user = await User.findOne( {name: req.body.name}) 
		if(user)
        res.status(422).send({"name": "Username in use"});
	    else 
		res.status(200).send({"available": true});
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

router.get('/users/me/avatar', async(req, res) => {
	
	try {
	 
	     if(req.header('Authorization')){
            const token = req.header('Authorization').replace('Bearer ', '')
		    const decoded = jwt.verify(token, process.env.SECRET_KEY)
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
			res.set('Content-Type', 'image/png')
			res.send(user.avatar)
            //res.status(201).send({ authenticated: true, name: user.name })
		 }
		
		 else res.status(200).send({ authenticated: false, name: null })
          

    } catch (e) {
        res.status(404).send()
    }	
	
	 // // // // // // // // // // try{
		 // // // // // // // // // // if(!req.user || !req.user.avatar){
         // // // // // // // // // // throw new error()
		 // // // // // // // // // // }
		 // // // // // // // // // // res.set('Content-Type', 'image/png')
	     // // // // // // // // // // res.send(req.user.avatar)
	   
	    // // // // // // // // // // } catch(e) {
		 // // // // // // // // // // res.status(404).send()
	    // // // // // // // // // // }
	
     // try {
     // const user = await User.findById(req.params.id)
     // if(!user || !user.avatar){
     // throw new Error()
     // }
     // res.set('Content-Type', 'image/png')
     // res.send(user.avatar)
     // }
     // catch(e){
     // res.status(404).send()
     // }
})

module.exports = router