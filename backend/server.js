const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const apiMonitor = require('./src/middlewares/apiMonitor');

dotenv.config({ override: true });

const connectdb = require("./src/config/connect");

const publicProductRoute = require("./src/Routes/publicProductRoute");
const adminProductRoute = require("./src/Routes/adminProductRoute");
const adminUploadRoute = require("./src/Routes/adminUploadRoute");
const orderRoute = require("./src/Routes/orderRoute");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// Minimal health check endpoint
app.get('/health', (req, res) => res.send('OK'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

connectdb();

app.use("/api/products", publicProductRoute);
app.use("/api/admin/products", adminProductRoute);
app.use("/api/admin/upload", adminUploadRoute);
app.use("/api/admin/products/upload", adminUploadRoute);
app.use("/api/upload", adminUploadRoute);
app.use("/api/orders", orderRoute);

app.use(apiMonitor);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    // Log error details
    console.error('API Error:', {
      status,
      message,
      stack: err.stack,
      errors: err.errors ? Object.values(err.errors).map((error) => error.message) : []
    });
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
