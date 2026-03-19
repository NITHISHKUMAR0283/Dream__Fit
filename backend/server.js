const express = require("express");
const dotenv = require("dotenv")
const connectdb = require("./src/config/connect")
const projectRoute = require("./src/Routes/productRoute")
dotenv.config();
const app = express();
app.use(express.json())
const port = process.env.PORT || 5000;

connectdb();
app.use("/api/products",projectRoute);
app.use((err,req, res,next)=>{
    const status=err.status||500;
    const message= err.message || "Internal Server Error";
    return res.status(status).json({
        success: false,
        status,
        message,
        errors: err.errors ? Object.values(err.errors).map(e => e.message) : []
    });
});
app.listen(port,()=>{
    console.log(`server listening in port ${port}`);
   
});
