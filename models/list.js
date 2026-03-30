const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const taskSchema=new Schema({
    task:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    ftime:{
        type:String,
        match:/^(0?[1-9]|1?[0-2]):[0-5][0-9]$/,
        required:true
    },
    Totime:{
        type:String,
        match:/^(0?[1-9]|1?[0-2]):[0-5][0-9]$/,
        required:true
    },
    fmeridiem:{
        type:String,
        enum:["AM","PM"],
        required:true
    },
    Tomeridiem:{
        type:String,
        enum:["AM","PM"],
        required:true
    },
    priority:{
        type:Number,
        min:0,
        max:5,
        default:2,
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required: true
    }
})

const task = mongoose.model("task", taskSchema);
module.exports=task;