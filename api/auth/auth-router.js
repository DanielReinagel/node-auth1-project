// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const bcrypt = require("bcryptjs");
const { checkUsernameFree, checkUsernameExists, checkPasswordLength } = require("./auth-middleware");
const model = require("../users/users-model");

const router = require("express").Router();

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post("/register", checkUsernameFree, checkPasswordLength, (req, res) => {
  const credentials = {username:req.body.username, password:bcrypt.hashSync(req.body.password)};
  model.add(credentials)
    .then(user => res.status(201).json(user))
    .catch(err => res.status(500).json({where:"adding user", ...err}))
});

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.post("/login", checkUsernameExists, checkPasswordLength, (req, res) => {
  const { username, password } = req.body;
  model.findBy({username}).first()
    .then(user => {
      if(user&&bcrypt.compareSync(password, user.password)){
        req.session.user = { username };
        res.status(200).json({message:`Welcome ${username}!`});
      } else {
        res.status(401).json({message:"Invalid credentials"});
      }
    })
})

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
router.get("/logout", (req, res) => {
  if(req.session && req.session.user){
    req.session.destroy();
    res.status(200).json({message:"logged out"});
  } else {
    res.status(200).json({message:"no session"});
  }
})
 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;