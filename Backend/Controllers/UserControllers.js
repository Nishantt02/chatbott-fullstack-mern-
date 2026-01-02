
import User from '../Models/User.js'
import jwt from "jsonwebtoken";
import sendMail from "../Middlewares/SendMail.js";


export const loginUser = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
      });
    }

    const otp = Math.floor(Math.random() * 1000000);

    const verifyToken = jwt.sign({ user, otp }, process.env.Activation_sec, {
      expiresIn: "5m",
    });

    await sendMail(email, "ChatBot", otp);

    res.json({
      message: "Otp send to your mail",
      verifyToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { otp, verifyToken } = req.body;
    if (!verifyToken) return res.status(400).json({ message: "Token missing" });

    let verify;
    try {
      verify = jwt.verify(verifyToken, process.env.Activation_sec);
    } catch {
      return res.status(400).json({ message: "Otp expired or invalid token" });
    }

    if (verify.otp.toString() !== otp.toString())
      return res.status(400).json({ message: "Wrong otp" });

    const token = jwt.sign({ _id: verify.user._id }, process.env.Jwt_sec, {
      expiresIn: "5d",
    });

    res.json({ message: "Logged in successfully", user: verify.user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};