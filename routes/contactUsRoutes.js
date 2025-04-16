const express = require("express");
const router = express.Router();
const contactUsController = require("../controllers/contactUsController");

router.post("/addContact", contactUsController.addContact);
module.exports = router;
