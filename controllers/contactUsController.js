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

exports.getContact = async (req, res) => {
  try {
    const contacts = await Contact.findAll(); // Retrieve all contact entries
    res.status(200).json(contacts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve contacts.", error: error.message });
  }
};

exports.removeContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found." });
    }
    await contact.destroy();
    res.status(200).json({ message: "Contact deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete contact.",
      error: error.message,
    });
  }
};