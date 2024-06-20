const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

// index campgrounds
module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

// new campground
module.exports.renderNewForm = (req, res, next) => {
    res.render('campgrounds/new');
}

// create campground
module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Made A New Campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

// show campground
module.exports.showCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot Find Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

// edit campground
module.exports.renderEditForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot Find Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

// update campground
module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        };
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}});
    }; 
    req.flash('success', 'Successfully Updated Campground');
    res.redirect(`/campgrounds/${id}`);
}

// delete show 
module.exports.renderDeleteForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/delete', {campground});
}

// delete campground
module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted Campground');
    res.redirect('/campgrounds');
}