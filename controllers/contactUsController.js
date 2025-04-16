const bcrypt = require("bcrypt");
const Contact = require("../models/ContactUs");
require("dotenv").config();

exports.addContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    res
      .status(201)
      .json({ message: "ContactUs Data Stored Successfully.", contact });
  } catch (error) {
    res.status(500).json({ message: "Signup failed.", error: error.message });
  }
};
