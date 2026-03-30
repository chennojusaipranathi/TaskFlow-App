const list=require("./models/list");
const user=require("./models/user");
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
         //information save
         req.session.redirectUrl=req.originalUrl;
         req.flash("error","you must be logged in to create listing");
         return res.redirect("/login");
    }
    next();
}