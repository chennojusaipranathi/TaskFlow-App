const express=require("express");
const app = express();
const mongoose = require('mongoose');
const path=require("path");
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
const session=require("express-session");
const flash=require("connect-flash");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
const tasks = require("./models/list.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
app.use(express.static(path.join(__dirname,"public")));
const expressError=require("./utils/expressError.js");
const User=require("./models/user.js");


const wrapAsync=require("./utils/wrapAsync.js");
const {isLoggedIn}=require("./middleware.js");

main().then(()=>{
    console.log("successfull");
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/task');
}

/*flash message install express-session anf connect-flash*/
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
       expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    }
}))

app.use(flash());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})

const userRouter=require("./routes/user.js");




app.use(passport.initialize());//initialise passport middleware
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//storing info in the session so that hey no need to login again and again
passport.deserializeUser(User.deserializeUser());
app.use("/",userRouter);

// app.get("/demouser",async(req,res)=>{
//   let fake=new User({
//     username:"student"//pbkdf2 algorithm is used
//   });//Register method  to register a new user
//   let regUser=await User.register(fake,"helloworld");
//   res.send(regUser);
// })

app.get('/show/:id',isLoggedIn,wrapAsync(async (req,res,next)=>{
  let {id}=req.params;
  const Task=await tasks.findById(id);
  if(!Task){
    req.flash("error","Task not found!");
    return res.redirect("/list");
  }
  res.render("tasks/show.ejs",{Task});
}))

app.get('/new',isLoggedIn,(req,res,next)=>{
  res.render("tasks/new.ejs");
})

app.use((req,res,next)=>{
  res.locals.curruser=req.user;
  next();
})


// buttons
app.get('/list',isLoggedIn,async (req, res) => {
  const allTasks = await tasks.find({owner:req.user._id});
  res.render('tasks/list.ejs',{allTasks,user:req.user});
})


app.get('/list/priority',isLoggedIn,async (req, res) => {
  const allTasks = await tasks.find({owner:req.user._id}).sort({priority:-1});
  res.render('tasks/list.ejs',{allTasks,user:req.user});
})

app.get('/list/mrng',isLoggedIn,async (req, res) => {
   const allTasks = await tasks.find({ owner: req.user._id });
   const morningTasks = allTasks.filter(task => {
    if (task.fmeridiem === "AM") {
      let hour = parseInt(task.ftime.split(":")[0]);
      return hour < 12;
    }
    return false;
  });
  res.render("tasks/list.ejs", { allTasks: morningTasks, user: req.user });
})

  app.get('/list/night',isLoggedIn,async (req, res) => {
   const allTasks = await tasks.find({ owner: req.user._id });
   const nightTasks = allTasks.filter(task => {
    if (task.fmeridiem === "AM") {
      let hour = parseInt(task.ftime.split(":")[0]);
      return hour === 12;
    }
    else if(task.fmeridiem==="PM")
    {
      let hour=parseInt(task.ftime.split(":")[0]);
      return hour>=6 && hour<12;
    }
    return false;
  });
  res.render("tasks/list.ejs", { allTasks: nightTasks, user: req.user });
})

app.get('/list/afternoon',isLoggedIn,async (req, res) => {
   const allTasks = await tasks.find({ owner: req.user._id });
   const nightTasks = allTasks.filter(task => {
    if (task.fmeridiem === "PM") {
      let hour = parseInt(task.ftime.split(":")[0]);
      return hour<6;
    }
    return false;
  });
  res.render("tasks/list.ejs", { allTasks: nightTasks, user: req.user });
})






app.get('/edit/:id',isLoggedIn,wrapAsync(async(req,res,next)=>{
  let {id}=req.params;
  const Task=await tasks.findOne({ _id: id, owner: req.user._id });
  if(!Task)
  {
    req.flash("error","Task not found!")
  }
  res.render('tasks/edit.ejs',{Task});
}))

app.patch('/show/:id',isLoggedIn,wrapAsync(async (req, res,next) => {
  const { id } = req.params;
  const { task, description, ftime, fmeridiem, Totime, Tomeridiem } = req.body;

  await tasks.findByIdAndUpdate(
    id,
    { task, description, ftime, fmeridiem, Totime, Tomeridiem },
    { runValidators: true } 
  );

  req.flash("success", "Task updated successfully!");
  res.redirect(`/show/${id}`);
}));


app.post('/list',isLoggedIn,wrapAsync(async (req, res,next) => {
   console.log("BODY:", req.body);
  let {task, description, ftime, fmeridiem, Totime, Tomeridiem,priority} = req.body;

  // trim input
  ftime = ftime.trim();
  Totime = Totime.trim();

  const newtask = new tasks({task, description, ftime, fmeridiem, Totime, Tomeridiem,priority});
  newtask.owner=req.user._id;
  console.log("Logged in user:", req.user);
  await newtask.save();
  req.flash("success", "New task added successfully!");
  res.redirect("/list");
}));



app.delete('/list/:id',isLoggedIn,wrapAsync(async(req,res,next)=>{
  let {id}=req.params;
  await tasks.findByIdAndDelete(id);
  req.flash("success", "Task deleted!");
  res.redirect('/list');
}))



app.use((req,res,next)=>{
  next(new expressError(404,"Page not found!"));
})

app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong!"}=err;
  res.render("error.ejs",{message});
})


app.listen(8080,()=>{
    console.log("yes");
})