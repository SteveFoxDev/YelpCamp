const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, setReturnTo, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const { storage } = require('../cloudinary');
const multer = require('multer'); // parse form data from files (images)
const upload = multer({storage}); // destination for file uploads (storage from cloudinary file)

// Index
router.get('/', catchAsync(campgrounds.index));

// New
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Create
router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

// Show
router.get('/:id', setReturnTo, catchAsync(campgrounds.showCampground));

// Edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// Update
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground,  catchAsync(campgrounds.updateCampground));

// Delete Show
router.get('/:id/delete', isLoggedIn, isAuthor, catchAsync(campgrounds.renderDeleteForm));

// Delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;