const Listing=require("../models/listing");
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});

module.exports.index=async (req,res)=>{
    const allListings = await Listing.find({})
    //console.log(allListings);
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate: {path:"author",}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    else{
        res.render("listings/show.ejs",{listing});
    }
    
};

module.exports.createListing=async (req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit:1
    })
        .send();

    // console.log(response.body.features[0].geometry);
    let url=req.file.path;
    let filename=req.file.filename;
    
    const newlisting=new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    newlisting.image={url,filename};
    newlisting.geometry=response.body.features[0].geometry;
    //console.log(newlisting.geometry.coordinates);

    await newlisting.save();
    req.flash("success","New Listing Created!");
    // res.json({listing:newlisting});
    res.redirect("/listings");
    };

module.exports.renderEditForm=async (req,res)=>{
        const {id}=req.params;
        const listing = await Listing.findById(id);
        if(!listing){
            req.flash("error","Listing you requested for does not exist!");
            res.redirect("/listings");
        }
        let originalImageUrl=listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
        res.render("./listings/edit.ejs",{listing,originalImageUrl});
    };

module.exports.updateListing=async(req,res)=>{
        let {id}=req.params;
        //console.log(req.body);
        let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
        await console.log(listing);
        await listing.save();
        let response = await geocodingClient.forwardGeocode({
            query:req.body.listing.location,
            limit:1
        }).send();
        listing.geometry=response.body.features[0].geometry;
        await listing.save();
        console.log(listing);
        if(typeof req.file !=="undefined"){
            let url=req.file.path;
            let filename=req.file.filename;
            listing.image={url,filename};
            await listing.save();
        }
        await req.flash("success","Listing Updated");
        await res.redirect(`/listings/${id}`);
    };

module.exports.destroyListing=async(req,res)=>{
        let {id}=req.params;
        let deletedListing=await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success","Listing deleted");
        res.redirect("/listings");
    }