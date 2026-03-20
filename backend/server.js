const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config({ override: true });

const connectdb = require("./src/config/connect");
const publicProductRoute = require("./src/Routes/publicProductRoute");
const adminProductRoute = require("./src/Routes/adminProductRoute");
const adminUploadRoute = require("./src/Routes/adminUploadRoute");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

connectdb();
app.use("/api/products", publicProductRoute);
app.use("/api/admin/products", adminProductRoute);
app.use("/api/admin/upload", adminUploadRoute);
app.use("/api/admin/products/upload", adminUploadRoute);
app.use("/api/upload", adminUploadRoute);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    return res.status(status).json({
        success: false,
        status,
        message,
        errors: err.errors ? Object.values(err.errors).map((error) => error.message) : []
    });
});
app.listen(port, () => {
    console.log(`server listening in port ${port}`);
});
