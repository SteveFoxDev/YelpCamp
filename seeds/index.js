const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors, urls } = require('./seedHelper');
const Campground = require('../models/campground');

// ========== Mongoose Connection ==========
// =========================================
mongoose.connect('mongodb://localhost:27017/newYelp')
    .catch(error => console.log(error));

const db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database Connected');
});

// ========== Seed ==========
// ==========================
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i =0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `${sample(urls)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore saepe cumque blanditiis quidem asperiores impedit!',
            price: price
        });
        await camp.save();
    }
};

seedDB().then(() => {
    db.close();
});