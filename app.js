
if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
    console.log(process.env.SECRET);
}

const express=require("express");
const app = express();
const mongoose = require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
//for building authentication password strategies
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const dbURL=process.env.ATLASDB_URL;
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const { saveRedirectUrl } = require("./middleware.js");
main().then(()=>{
    console.log("connected to DB");
})
async function main(){
    await mongoose.connect(dbURL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store=MongoStore.create({
    mongoUrl:dbURL,
    crypto:{
        secret:"mysupersecretcode"
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    //tracks session
    cookie:{
        expires:Date.now()+7*24*60*1000,
        maxAge:1000*60*60*24*3,
        httpOnly:true
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//static serialize and deseralize
//this is more convenient as its prebuilt like using libraries
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    // console.log(res.locals.success);
    next();
});

app.get("/demouser",(async(req,res)=>{
    let fakeUser = new User({
        email:"student@gmail.com",
        username:"delta-student"
    });
    //parameters passed are User object and Password string
    let registeredUser= await User.register(fakeUser,"helloWorld");
    res.send(registeredUser);
}))



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})
//DBMS error handler middleware
app.use((err,req,res,next)=>{
    let {statusCode,message}=err;
    res.render("error.ejs",{message});
    //res.status(statusCode).send(message);
    //res.send("something went wrong");
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})