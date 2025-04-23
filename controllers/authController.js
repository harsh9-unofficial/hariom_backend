const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    const { fullname, username, email, phone, password } = req.body;

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
      phone,
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
    const user = await User.findOne({ 
      where: { id },
      attributes: ["id", "fullname", "username", "email", "phone", "createdAt", "dob"]
    });
    if (!user) {
      return res.status(401).json({ message: "No User Exists." });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve profile", error: error.message });
  }
};

exports.allProfile = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.findAll({
      attributes: ["id", "fullname", "username", "email", "phone", "createdAt"], // Include phone
    });

    // Return the list of users
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve users.", error: error.message });
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

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, phone, password, dob } = req.body;

    // Find user
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if new email is already registered (if email is being updated)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered." });
      }
    }

    // Prepare update data
    const updateData = {
      fullname: fullname || user.fullname,
      username: username || user.username,
      email: email || user.email,
      phone: phone || user.phone,
      dob: dob || user.dob, // Include dob in update data
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    await User.update(updateData, { where: { id } });

    // Fetch updated user
    const updatedUser = await User.findOne({
      where: { id },
      attributes: ["id", "fullname", "username", "email", "phone", "dob", "createdAt"], // Include dob in response
    });

    res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
};