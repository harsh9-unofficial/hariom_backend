const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
// const authMiddleware=require('../Middlewares/authMiddleware')

router.post("/add", wishlistController.addToWishlist);
router.get("/get/:userId", wishlistController.getWishlist);
router.put("/update/:wishlistId", wishlistController.updateWishlist);
router.delete("/remove/:wishlistId", wishlistController.removeWishlistItem);

module.exports = router;
