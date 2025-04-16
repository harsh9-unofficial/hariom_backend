const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

// Image Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Routes
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  categoryController.createCategory
);

router.get("/", categoryController.getCategories);

// Update Category
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  categoryController.updateCategory
);

// Delete Category
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

module.exports = router;
