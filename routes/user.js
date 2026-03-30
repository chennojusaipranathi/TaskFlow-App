const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const User=require("../models/user.js");
const passport=require("passport");
router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let {username,password}=req.body;
    const newUser=new User({username,password});
    const registeredUser=await User.register(newUser,password)
    console.log(registeredUser);
    req.flash("success","You have registered Successfully!");
    res.redirect("/list");
    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}))
router.get("/login",(req,res)=>{
    res.render("users/login");
})
router.post("/login", passport.authenticate('local', { failureRedirect: '/login' ,failureFlash:true}),
  async(req,res)=>{
    req.flash("success","You have successfully logged in!");
    res.redirect("/list");
  });
module.exports=router;

router.get("/logout",(req,res,next)=>{
    req.logout(function(err){
        if(err){return next(err);}
         req.flash("success","You have successfully logged out!");
    res.redirect("/login");
    })
})