const model = require("../users/users-model");
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({message:"You shall not pass!"});
  }
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
function checkUsernameFree(req, res, next) {
  const username = req.body.username;
  if(username)
    model.findBy({username})
      .then(users => users.length ? res.status(422).json({message:"Username taken"}) : next())
      .catch(err => res.status(500).json({simple:"getting user", error:err, message:err.message, stack:err.stack}))
  else res.status(400).json({message:"You must include a username"});
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
function checkUsernameExists(req, res, next) {
  const username = req.body.username;
  if(username)
    model.findBy({username})
      .then(users => users.length ? next() : res.status(401).json({message:"Invalid credentials"}))
      .catch(err => res.status(500).json({simple:"getting user", error:err, message:err.message, stack:err.stack}))
  else res.status(400).json({message:"You must include a username"});
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  const pw = req.body.password;
  if(pw && pw.length>3){
    next();
  } else {
    res.status(422).json({message:"Password must be longer than 3 chars"});
  }
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
};