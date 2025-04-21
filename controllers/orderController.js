const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const sequelize = require("../config/db");
const User = require("../models/User");
const { Op } = require("sequelize");

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    console.log("Incoming Order Payload:", JSON.stringify(req.body, null, 2));

    const {
      userId,
      shippingCharge,
      tax,
      totalPrice,
      paymentMethod,
      formData,
      status,
      orderItems,
    } = req.body;

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      apt,
      city,
      state,
      postalCode,
    } = formData || {};

    console.log("Final Extracted Data:", { firstName, email, phone, address });

    // Validate all required fields based on Order model
    if (
      !userId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !apt ||
      !city ||
      !state ||
      !postalCode ||
      !tax ||
      !totalPrice ||
      !paymentMethod ||
      !status ||
      !orderItems ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Validate status
    if (![1, 2, 3, 4, 5].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Validate userId exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: `User with ID ${userId} not found` });
    }

    // Validate productIds exist
    const productIds = orderItems.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      transaction,
    });
    if (products.length !== productIds.length) {
      await transaction.rollback();
      return res.status(400).json({ error: "One or more products not found" });
    }

    // Create order
    const order = await Order.create(
      {
        userId,
        shippingCharge: shippingCharge || 0,
        tax,
        totalPrice,
        paymentMethod,
        firstName,
        lastName,
        email,
        phone,
        address,
        apt,
        city,
        state,
        postalCode,
        status,
      },
      { transaction }
    );

    // Create order items
    const createdOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        console.log("Creating Order Item:", item);
        if (!item.productId || !item.quantity || !item.price) {
          throw new Error(`Invalid order item data: ${JSON.stringify(item)}`);
        }
        return await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalAmount: item.quantity * item.price,
          },
          { transaction }
        );
      })
    );

    // Delete user's cart
    await Cart.destroy({ where: { userId }, transaction });

    // Commit transaction if all operations succeed
    await transaction.commit();

    return res.status(201).json({
      message: "Order placed successfully!",
      order,
      orderItems: createdOrderItems,
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("Error in Order Creation:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      error: "Something went wrong",
      details: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "images"], // Include only necessary fields
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Simplify image processing since Product.images is a JSON array
    const processedOrder = {
      ...order.toJSON(),
      OrderItems: order.OrderItems.map((item) => ({
        ...item.toJSON(),
        Product: {
          ...item.Product.toJSON(),
          images: item.Product.images || [], // Ensure images is an array
        },
      })),
    };

    res.status(200).json(processedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch order", error });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "images"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Process images for all orders
    const processedOrders = orders.map((order) => ({
      ...order.toJSON(),
      OrderItems: order.OrderItems.map((item) => ({
        ...item.toJSON(),
        Product: {
          ...item.Product.toJSON(),
          images: item.Product.images || [],
        },
      })),
    }));

    return res.status(200).json(processedOrders);
  } catch (error) {
    console.log("Error fetching orders:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "images"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Process images for user orders
    const processedOrders = orders.map((order) => ({
      ...order.toJSON(),
      OrderItems: order.OrderItems.map((item) => ({
        ...item.toJSON(),
        Product: {
          ...item.Product.toJSON(),
          images: item.Product.images || [],
        },
      })),
    }));

    return res.status(200).json(processedOrders);
  } catch (error) {
    console.log("Error fetching user orders:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  console.log("body", req.body);

  try {
    // Validate status
    if (!status || ![1, 2, 3, 4, 5].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await Order.update({ status }, { where: { id: orderId } });
    const updatedOrder = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "images"],
            },
          ],
        },
      ],
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Process images
    const processedOrder = {
      ...updatedOrder.toJSON(),
      OrderItems: updatedOrder.OrderItems.map((item) => ({
        ...item.toJSON(),
        Product: {
          ...item.Product.toJSON(),
          images: item.Product.images || [],
        },
      })),
    };

    res.status(200).send({
      message: "Order Status Updated Successfully",
      order: processedOrder,
    });
    console.log("updatedOrder", orderId, processedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating order status" });
  }
};

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await Order.destroy({ where: { id: orderId } });
    res.status(200).json({ message: "Order deleted successfully" });
    console.group("order deleted");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order", error });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 1) {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled." });
    }

    order.status = 5;
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
};
