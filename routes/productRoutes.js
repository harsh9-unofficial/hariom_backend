const express = require("express");
const router = express.Router();
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
router.get("/all-products", productController.getProductsForAllProductPage);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/best-sellers", productController.getBestSellers);
router.get("/:id", productController.getProducts);
router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 10),
  productController.updateProduct
);
router.delete("/:id", productController.deleteProduct);
router.get("/category/:categoryName", productController.getProductsByCategory);

module.exports = router;