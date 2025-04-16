const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.isAdmin = false;
    return next();
  } catch (userError) {
    try {
      let decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
      if (!decoded.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Not an admin" });
      }
      req.isAdmin = true;
      return next();
    } catch (adminError) {
      return res.status(400).json({ message: "Invalid token" });
    }
  }
};

module.exports = authenticateToken;
