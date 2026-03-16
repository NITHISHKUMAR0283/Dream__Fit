const mongoose = require("mongoose");
const connect = async ()=>{
try{
const connectDB = await mongoose.connect(process.env.MONGO_URI);
console.log("Connected successfully");}
catch(err){
    console.log(` Error : ${err}`);
}}
module.exports = connect;
