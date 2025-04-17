const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");

// CRUD Routes
router.post("/", ratingController.addOrUpdateRating); // Add or update a rating
router.get("/", ratingController.getAllReviews); // Get all reviews
router.get("/products/:productId", ratingController.getRatingsByProduct); // Get ratings by product
router.delete("/:ratingId", ratingController.deleteReview); // Delete a review

module.exports = router;
