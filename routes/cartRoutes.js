const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
// const authMiddleware=require('../Middlewares/authMiddleware')

router.post("/add", cartController.addToCart);
router.get("/get/:userId", cartController.getCart);
router.put("/update/:cartId", cartController.updateCart);
router.delete("/remove/:cartId", cartController.removeCartItem);

module.exports = router;
