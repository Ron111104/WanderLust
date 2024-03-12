const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
//ejs-mate helps us in creation of templates
const Listing = require("../models/listing.js");
//isloggedin is a function to check obv
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
//for parsing multi type data
const multer=require('multer');
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

router
    .route("/")
    //Index route
    .get(wrapAsync(listingController.index))
    //creation of the new route whose details we entered
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );


//creation of new listings
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
    .route("/:id")
    //show route
    .get(wrapAsync(listingController.showListing))
    //Update route
    .put(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
    wrapAsync(listingController.updateListing))
    //delete route
    .delete(
    isLoggedIn,
    wrapAsync(listingController.destroyListing));





//edit route
router.get("/:id/edit",isLoggedIn,isOwner,
    wrapAsync(listingController.renderEditForm));

module.exports=router;




// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Chennai",
//         country:"India",

//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful test");
// });