const mongoose=require("mongoose");
const Connection=()=>{
    mongoose.connect("mongodb://localhost:27017/Registration").then(()=>{
    console.log("Database Connected");
    })
}
Connection();
module.exports=Connection; 