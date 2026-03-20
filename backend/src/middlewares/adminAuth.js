const ADMIN_EMAIL = process.env.ADMINEMAIL || process.env.ADMIN_EMAIL || "your.email@example.com";
const ADMIN_PASSWORD = process.env.ADMINPASS || process.env.ADMIN_PASSWORD || "yourStrongPassword";

const adminAuth = (req, res, next) => {
  const { email, password } = req.headers;

  if (!email || !password) {
    return res.status(401).json({ message: "Admin credentials required" });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return next();
  }

  return res.status(403).json({
    message: "Unauthorized: Invalid admin credentials"
  });
};

module.exports = adminAuth;