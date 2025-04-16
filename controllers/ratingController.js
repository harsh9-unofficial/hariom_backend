const Rating = require("../models/Ratings");
const Product = require("../models/Product");
const User = require("../models/User");

const addOrUpdateRating = async (req, res) => {
  const { productId, userId, rating, review } = req.body;

  try {
    let message = "";

    console.log("Incoming Data:", req.body);

    const existingRating = await Rating.findOne({
      where: {
        productId,
        userId,
      },
    });

    if (existingRating) {
      await Rating.update(
        { rating, review },
        { where: { ratingId: existingRating.ratingId } }
      );
      message = "Rating updated successfully";
    } else {
      await Rating.create({ productId, userId, rating, review });
      message = "Rating added successfully";
    }

    const ratings = await Rating.findAll({ where: { productId } });

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating =
      totalRatings > 0 ? Math.round(sumRatings / totalRatings) : 0;

    await Product.update(
      { averageRating, totalRatings },
      { where: { productId } }
    );

    res.status(200).json({ message });
  } catch (error) {
    console.error("Error in addOrUpdateRating:", error);
    res.status(500).json({ message: "Failed to submit rating", error });
  }
};

const getRatingsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const ratings = await Rating.findAll({
      where: { productId },
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
  try {
    const { ratingId } = req.params;
    const rating = await Rating.findOne({ where: { ratingId } });
    if (!rating) return res.status(400).json({ message: "Review not found" });

    const productId = rating.productId;
    await rating.destroy();

    const ratings = await Rating.findAll({ where: { productId } });
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating =
      totalRatings > 0 ? Math.round(sumRatings / totalRatings) : 0;

    await Product.update(
      { averageRating, totalRatings },
      { where: { productId } }
    );

    res.status(200).json("Review deleted successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete Review" });
  }
};

module.exports = {
  addOrUpdateRating,
  getRatingsByProduct,
  getAllReviews,
  deleteReview,
};
