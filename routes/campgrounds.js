const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, setReturnTo, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer'); // parse form data from files (images)
const upload = multer({dest: 'uploads/'}); // destination for file uploads

// Index
router.get('/', catchAsync(campgrounds.index));

// New
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Create
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
router.post('/', upload.array('image'), (req, res, next) => {
    console.log(req.body, req.files);
    res.send('it worked');
});

// Show
router.get('/:id', setReturnTo, catchAsync(campgrounds.showCampground));

// Edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// Update
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// Delete Show
router.get('/:id/delete', isLoggedIn, isAuthor, catchAsync(campgrounds.renderDeleteForm));

// Delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;