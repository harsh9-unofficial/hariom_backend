const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity) {
      return res
        .status(400)
        .json({
          message: "Something is missing in userId, productId, or quantity",
        });
    }
    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.status(200).json({ message: "Cart Updated..." });
    }

    const newCartItem = await Cart.create({ userId, productId, quantity });
    console.log("Added to cart");

    res
      .status(201)
      .json({ message: "Item added to cart", cartItem: newCartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
    console.log(error);
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(req.params);

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    console.log("Fetching Cart for User ID:", userId);
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["name", "price", "description","size"],
        },

      ],
    });
    const formattedCartItems = cartItems.map((item) => {
      const product = item.product;
      console.log(product);
      
      return {
        ...item.toJSON(), // Convert Sequelize instance to raw JSON
        product: {
          ...product.toJSON(),
          images: product.images ? product.images.map((img) => img.imageUrl) : [], // Array of image URLs
        },
      };
    });
    res.status(200).json(formattedCartItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving cart", error: error.message });
    console.log(error);
  }
};

const updateCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ message: "Quantity is required" });
    }
    const cartItem = await Cart.findByPk(cartId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (quantity <= 0) {
      await cartItem.destroy();
      return res.status(200).json({ message: "Cart item removed" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ message: "Cart item updated", cartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cartItem = await Cart.findByPk(cartId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    await cartItem.destroy();
    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting cart item", error: error.message });
  }
};

module.exports = { addToCart, getCart, updateCart, removeCartItem };
