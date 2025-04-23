const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/profile/:id", authMiddleware, authController.profile);
router.get("/profile", authMiddleware, authController.allProfile);

router.delete("/:id", authMiddleware, authController.deleteAccount);

router.patch("/profile/:id", authMiddleware, authController.updateProfile);

module.exports = router;
