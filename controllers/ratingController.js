const Rating = require("../models/Ratings");
const Product = require("../models/Product");
const User = require("../models/User");
const sequelize = require("../config/db");

const addOrUpdateRating = async (req, res) => {
  const { productId, userId, rating, description } = req.body;

  try {
    if (!productId || !userId || !rating || !description) {
      return res.status(400).json({
        message:
          "Missing required fields (productId, userId, rating, description)",
      });
    }
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const existingRating = await Rating.findOne({
      where: {
        productId,
        userId,
      },
    });

    if (existingRating) {
      await Rating.update(
        { rating, description },
        { where: { id: existingRating.id } } // Use 'id' as primary key
      );
    } else {
      await Rating.create({ productId, userId, rating, description });
    }

    const ratings = await Rating.findAll({ where: { productId } });
    const totalReviews = ratings.length;
    const sumRatings = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRatings =
      totalReviews > 0 ? Math.round(sumRatings / totalReviews) : 0;

    await Product.update(
      { averageRatings, totalReviews },
      { where: { id: productId } } // Use 'id' to match Product model
    );

    res.status(200).json({
      message: existingRating ? "Rating updated" : "Rating added",
      averageRatings,
      totalReviews,
    });
  } catch (error) {
    console.error("Error in addOrUpdateRating:", error);
    res
      .status(500)
      .json({ message: "Failed to submit rating", error: error.message });
  }
};

const getRatingsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const ratings = await Rating.findAll({
      where: { productId },
      include: [{ model: User, attributes: ["fullName"] }], // Include user details
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error in getRatingsByProduct:", error);
    res.status(500).json({ message: "Failed to fetch ratings", error });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Rating.findAll({
      include: [
        { model: Product, attributes: ["name"] },
        { model: User, attributes: ["fullName", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteReview = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { ratingId } = req.params; // Match with route parameter
    if (!ratingId || isNaN(ratingId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const rating = await Rating.findOne({
      where: { id: ratingId },
      transaction,
    });
    if (!rating) {
      await transaction.rollback();
      return res.status(400).json({ message: "Review not found" });
    }

    const productId = rating.productId;
    if (!productId) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Invalid product ID associated with review" });
    }

    await rating.destroy({ transaction });

    const ratings = await Rating.findAll({ where: { productId }, transaction });
    const totalReviews = ratings.length;
    const sumRatings = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRatings =
      totalReviews > 0 ? Math.round(sumRatings / totalReviews) : 0;

    const [updatedRows] = await Product.update(
      { averageRatings, totalReviews },
      { where: { id: productId }, transaction }
    );

    if (updatedRows === 0) {
      throw new Error("Failed to update Product table");
    }

    await transaction.commit();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in deleteReview:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Failed to delete Review",
      error: error.message,
    });
  }
};

module.exports = {
  addOrUpdateRating,
  getRatingsByProduct,
  getAllReviews,
  deleteReview,
};
