const mongoose = require('mongoose');
const initData=require("./data.js");
const tasks=require("../models/list.js");
main().then(()=>{
    console.log("successfull");
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/task');
}

const initDB= async()=>{
    await tasks.deleteMany({});
    await tasks.insertMany(initData.data);
    console.log("data was initialised");
}
initDB();
