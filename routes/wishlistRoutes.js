const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
// const authMiddleware=require('../Middlewares/authMiddleware')

router.post("/add", wishlistController.addToWishlist);
router.get("/get/:userId", wishlistController.getWishlist);
router.put("/update/:cartId", wishlistController.updateWishlist);
router.delete("/remove/:cartId", wishlistController.removeWishlistItem);

module.exports = router;
