var mongoose = require('mongoose');

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
  name: String,
  price: String,
  rate: String,
  image: String,
  description: String,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Comment"
    }
  ]
});

var Campground = mongoose.model("Campground", campgroundSchema); //Campground DB variable
module.exports = Campground;
