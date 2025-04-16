const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Routes
router.post(
  "/",
  authMiddleware,
  upload.array("images", 10),
  productController.createProduct
);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProducts);
router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 10),
  productController.updateProduct
);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
