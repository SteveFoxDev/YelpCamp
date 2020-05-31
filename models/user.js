var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  avatar: String,
  firstName: String,
  lastName: String,
  email: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose); //Adds Passport Methods to Schema

var User = mongoose.model("User", UserSchema);

module.exports = User;
