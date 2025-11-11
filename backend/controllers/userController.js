import mongoose from 'mongoose';
import User from '../models/userModel.js';
import validator from  "validator";
import bcrypt from "bcrypt.js";
import jwt from "jsonwebtoken";

// TOKEN CONFIG
const TOKEN_EXPIRES_IN = "24h"; 
const JWT_SECRET = "your_jwt_secret_here"; 

// FUNCTION TO CREATE TOKEN
const createToken = (userId) => {
  const secret = JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined on the server");
  }

  // Create and return signed JWT
  return jwt.sign({ id: userId }, secret, { expiresIn: TOKEN_EXPIRES_IN });
};





// REGISTER FUNCTION
export async function register(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const emailRaw = String(req.body.email || "").trim();
    const email =
      validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
    const password = String(req.body.password || "");

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    // (Optional) Validate password strength
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }


    //Check if user already exists
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }



    const newId = new mongoose.Types.ObjectId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User ({
        _id: newId,
        name,
        email,
        password: hashedPassword,
    });
    await user.save();

    const token = createToken(newId.toString());


    return res.status(200).json({
      success: true,
      message: "User registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });


  } catch (error) {
    console.error("Error in register function:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
}

// Login Function

export async function login(req, res) {
  try {
    // Extract and sanitize inputs
    const emailRaw = String(req.body.email || "").trim();
    const email = validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
    const password = String(req.body.password || "");

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if email is valid
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
}