const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created.", userId: user.id });
  } catch (error) {
    res.status(500).json({ message: "Signup failed.", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's an admin login
    if (email === process.env.ADMIN_EMAIL) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Generate admin JWT token
      const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET_ADMIN, {
        expiresIn: "12h",
      });

      return res.json({
        message: "Admin login successful",
        isAdmin: true,
        token,
      });
    }

    // Normal user login
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email is not registered." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({ message: "Login successful", userId: user.id, token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(401).json({ message: "No User Exists." });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete the user
    await User.destroy({ where: { id } });

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user.", error: error.message });
  }
};
