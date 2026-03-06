const express = require("express");
const dotenv = require("dotenv")

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use("/",(req,res)=>{
    res.status(200).json({
        message: "hello world",
        success:true
    })
})
app.listen(port,()=>{
    console.log(`server listening in port ${port}`);
   
});
