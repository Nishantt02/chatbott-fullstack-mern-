
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    // ✅ Get the token from the "Authorization" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Please login" });
    }

    // ✅ Extract token after "Bearer "
    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.Jwt_sec);

    // ✅ Attach user info to request
    req.user = await User.findById(decoded._id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
