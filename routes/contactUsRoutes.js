const express = require("express");
const router = express.Router();
const contactUsController = require("../controllers/contactUsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/addContact", contactUsController.addContact);
router.get("/getContact", authMiddleware, contactUsController.getContact);
router.delete("/remove/:id", authMiddleware, contactUsController.removeContact);
module.exports = router;
