const express=require("express");
//allows id passed from app.js to reach review.js
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
//ejs-mate helps us in creation of templates
const Review=require("../models/review.js");
const Listing = require("../models/listing.js");

const {validateReview, isLoggedIn , isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");

//REviews
//POST ROUTE
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview));

//deleting reviews route
router.delete("/:reviewId",
    isLoggedIn,isReviewAuthor
    ,wrapAsync(reviewController.destroyReview));

module.exports= router;