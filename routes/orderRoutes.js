const express = require("express");
const router = express.Router();
const orderControlller = require("../controllers/orderController");
// const authMiddleware=require('../Middlewares/authMiddleware')

router.post("/create", orderControlller.createOrder);
router.get("/getall",orderControlller.getAllOrders);
router.put("/updatestatus/:orderId",orderControlller.updateOrderStatus);
router.get("/get/:orderId",orderControlller.getOrderById);
router.get("/getuserorder/:userId",orderControlller.getUserOrders);
router.put("/cancel/:orderId",orderControlller.cancelOrder);

module.exports = router;
