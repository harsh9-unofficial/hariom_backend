const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({
        message: "Something is missing in userId or productId",
      });
    }
    const existingWishlistItem = await Wishlist.findOne({
      where: { userId, productId },
    });
    if (existingWishlistItem) {
      return res.status(200).json({ message: "Item already in wishlist" });
    }

    const newWishlistItem = await Wishlist.create({ userId, productId });

    res
      .status(201)
      .json({
        message: "Item added to wishlist",
        wishlistItem: newWishlistItem,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to wishlist", error: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["name", "price", "images"],
        },
      ],
    });

    res.status(200).json(wishlistItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "ProductId is required" });
    }
    const wishlistItem = await Wishlist.findByPk(wishlistId);
    if (!wishlistItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    wishlistItem.productId = productId;
    await wishlistItem.save();
    res.status(200).json({ message: "Wishlist item updated", wishlistItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating wishlist", error: error.message });
  }
};

const removeWishlistItem = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const wishlistItem = await Wishlist.findByPk(wishlistId);
    if (!wishlistItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }
    await wishlistItem.destroy();
    res.status(200).json({ message: "Wishlist item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting wishlist item", error: error.message });
  }
};

module.exports = { addToWishlist, getWishlist, updateWishlist, removeWishlistItem };
