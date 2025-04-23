const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const sequelize = require("../config/db");

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      userId,
      shippingCharge,
      tax,
      totalPrice,
      paymentMethod,
      status,
      orderItems,
      firstName,
      lastName,
      email,
      phone,
      address,
      apt,
      city,
      state,
      postalCode,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !totalPrice ||
      !paymentMethod ||
      !orderItems ||
      !orderItems.length ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !postalCode
    ) {
      await transaction.rollback();
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Validate and check stock for each order item
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: `Product with ID ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Create the order
    const order = await Order.create(
      {
        userId,
        shippingCharge,
        tax,
        totalPrice,
        paymentMethod,
        status,
        firstName,
        lastName,
        email,
        phone,
        address,
        apt,
        city,
        state,
        postalCode,
      },
      { transaction }
    );

    // Create order items and deduct stock
    for (const item of orderItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          totalAmount: item.quantity * item.price,
        },
        { transaction }
      );

      // Deduct stock
      const product = await Product.findByPk(item.productId, { transaction });
      await product.update(
        { stock: product.stock - item.quantity },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: order.id,
        userId: order.userId,
        shippingCharge: order.shippingCharge,
        tax: order.tax,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        status: order.status,
        orderItems,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message || "Server error" });
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
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

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
  } catch (error) {
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
