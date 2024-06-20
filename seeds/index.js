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
            author: '666c66b2103d7c26479ea388',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore saepe cumque blanditiis quidem asperiores impedit!',
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dvxdkiqz8/image/upload/v1718904985/YelpCampNew/mlwrebisgicn3sez6jtr.jpg',
                    filename: 'YelpCampNew/mlwrebisgicn3sez6jtr'
                },
                {
                    url: 'https://res.cloudinary.com/dvxdkiqz8/image/upload/v1718904986/YelpCampNew/keeyfmbx3zq3nwoavtua.jpg',
                    filename: 'YelpCampNew/keeyfmbx3zq3nwoavtua'
                }
            ]
        });
        await camp.save();
    }
};

seedDB().then(() => {
    db.close();
});