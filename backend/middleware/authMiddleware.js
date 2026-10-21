const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header("Authorization");
  
  // Log for debugging
  console.log("Auth header:", authHeader ? "Present" : "Missing");
  
  // Check if no auth header
  if (!authHeader) {
    console.log("No Authorization header");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  // Extract token
  const parts = authHeader.split(" ");
  
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.log("Invalid Authorization format, expected 'Bearer [token]'");
    return res.status(401).json({ error: "Invalid token format" });
  }
  
  const token = parts[1];
  
  // Check if token exists
  if (!token) {
    console.log("Empty token");
    return res.status(401).json({ error: "Access denied. Token is empty." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    console.log("Authentication successful for user ID:", decoded.id);
    
    // Proceed to next middleware
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token. Please log in again." });
    }
    
    res.status(400).json({ error: "Invalid token" });
  }
};
