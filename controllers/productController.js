const Product = require("../models/Product");
const Category = require("../models/Category");
const path = require("path");
const fs = require("fs");
const OrderItem = require("../models/OrderItem");
const sequelize = require("../config/db");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      price,
      shortDescription,
      longDescription,
      stock,
      features,
      howToUse,
      suitableSurfaces,
      volume,
      ingredients,
      scent,
      phLevel,
      shelfLife,
      madeIn,
      packaging,
      combos,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !categoryId ||
      !price ||
      !shortDescription ||
      !longDescription ||
      !suitableSurfaces ||
      !ingredients
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Parse features
    let parsedFeatures = [];
    try {
      parsedFeatures = JSON.parse(features);
      if (!Array.isArray(parsedFeatures)) {
        throw new Error("Features must be an array");
      }
    } catch (e) {
      return res.status(400).json({ message: "Invalid features format" });
    }

    // Parse howToUse
    let parsedHowToUse = [];
    try {
      parsedHowToUse = JSON.parse(howToUse);
      if (!Array.isArray(parsedHowToUse)) {
        throw new Error("How to Use must be an array");
      }
    } catch (e) {
      return res.status(400).json({ message: "Invalid how to use format" });
    }

    // Handle uploaded images
    const imagePaths = req.files
      ? req.files.map((file) =>
          path.join("uploads", file.filename).replace(/\\/g, "/")
        )
      : [];

    // Validate category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Validate numeric fields
    const parsedVolume = volume ? parseFloat(volume) : null;
    if (parsedVolume !== null && parsedVolume < 0) {
      return res.status(400).json({ message: "Volume cannot be negative" });
    }

    const parsedPhLevel = phLevel ? parseFloat(phLevel) : null;
    if (parsedPhLevel !== null && (parsedPhLevel < 0 || parsedPhLevel > 14)) {
      return res
        .status(400)
        .json({ message: "pH Level must be between 0 and 14" });
    }

    const parsedShelfLife = shelfLife ? parseInt(shelfLife) : null;
    if (parsedShelfLife !== null && parsedShelfLife < 0) {
      return res.status(400).json({ message: "Shelf Life cannot be negative" });
    }

    // Convert combos to boolean
    const parsedCombos = combos === "true" || combos === true;

    // Create product
    const product = await Product.create({
      name,
      categoryId,
      price: parseFloat(price),
      shortDescription,
      longDescription,
      stock: parseInt(stock) || 0,
      features: parsedFeatures,
      howToUse: parsedHowToUse,
      suitableSurfaces,
      images: imagePaths,
      volume: parsedVolume,
      ingredients,
      scent,
      phLevel: parsedPhLevel,
      shelfLife: parsedShelfLife,
      madeIn,
      packaging,
      averageRatings: 0,
      totalReviews: 0,
      combos: parsedCombos,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      price,
      shortDescription,
      longDescription,
      stock,
      features,
      howToUse,
      suitableSurfaces,
      volume,
      ingredients,
      scent,
      phLevel,
      shelfLife,
      madeIn,
      packaging,
      combos,
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse features
    let parsedFeatures = product.features;
    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
        if (!Array.isArray(parsedFeatures)) {
          throw new Error("Features must be an array");
        }
      } catch (e) {
        return res.status(400).json({ message: "Invalid features format" });
      }
    }

    // Parse howToUse
    let parsedHowToUse = product.howToUse;
    if (howToUse) {
      try {
        parsedHowToUse = JSON.parse(howToUse);
        if (!Array.isArray(parsedHowToUse)) {
          throw new Error("How to Use must be an array");
        }
      } catch (e) {
        return res.status(400).json({ message: "Invalid how to use format" });
      }
    }

    // Handle images
    let imagePaths = product.images;
    if (req.files && req.files.length > 0) {
      if (Array.isArray(product.images)) {
        product.images.forEach((imagePath) => {
          const fullPath = path.join(__dirname, "../", imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      imagePaths = req.files.map((file) =>
        path.join("uploads", file.filename).replace(/\\/g, "/")
      );
    }

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    // Validate numeric fields
    const parsedVolume =
      volume !== undefined ? parseFloat(volume) : product.volume;
    if (parsedVolume !== null && parsedVolume < 0) {
      return res.status(400).json({ message: "Volume cannot be negative" });
    }

    const parsedPhLevel =
      phLevel !== undefined ? parseFloat(phLevel) : product.phLevel;
    if (parsedPhLevel !== null && (parsedPhLevel < 0 || parsedPhLevel > 14)) {
      return res
        .status(400)
        .json({ message: "pH Level must be between 0 and 14" });
    }

    const parsedShelfLife =
      shelfLife !== undefined ? parseInt(shelfLife) : product.shelfLife;
    if (parsedShelfLife !== null && parsedShelfLife < 0) {
      return res.status(400).json({ message: "Shelf Life cannot be negative" });
    }

    // Convert combos to boolean
    const parsedCombos =
      combos !== undefined
        ? combos === "true" || combos === true
        : product.combos;

    // Update product
    await product.update({
      name: name || product.name,
      categoryId: categoryId || product.categoryId,
      price: price ? parseFloat(price) : product.price,
      shortDescription: shortDescription || product.shortDescription,
      longDescription: longDescription || product.longDescription,
      stock: stock ? parseInt(stock) : product.stock,
      features: parsedFeatures,
      howToUse: parsedHowToUse,
      suitableSurfaces: suitableSurfaces || product.suitableSurfaces,
      images: imagePaths,
      volume: parsedVolume,
      ingredients: ingredients || product.ingredients,
      scent: scent || product.scent,
      phLevel: parsedPhLevel,
      shelfLife: parsedShelfLife,
      madeIn: madeIn || product.madeIn,
      packaging: packaging || product.packaging,
      combos: parsedCombos,
    });

    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all products with category data
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ["name"],
          as: "Category",
        },
      ],
    });

    // Transform the response to flatten the category name
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      category: product.Category ? product.Category.name : "-",
      price: product.price,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      stock: product.stock,
      features: product.features,
      howToUse: product.howToUse,
      suitableSurfaces: product.suitableSurfaces,
      images: product.images,
      volume: product.volume,
      ingredients: product.ingredients,
      scent: product.scent,
      phLevel: product.phLevel,
      shelfLife: product.shelfLife,
      madeIn: product.madeIn,
      packaging: product.packaging,
      averageRatings: product.averageRatings,
      totalReviews: product.totalReviews,
      combos: product.combos,
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single product by ID
exports.getProducts = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get products for AllProductPage
exports.getProductsForAllProductPage = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "price",
        "images",
        "categoryId",
        "averageRatings",
        "combos",
      ],
      include: [
        {
          model: Category,
          attributes: ["name"],
          as: "Category",
        },
      ],
    });

    // Transform the response to match frontend expectations
    const formattedProducts = products.map((item) => {
      const productData = item.toJSON();
      return {
        ...productData,
        images:
          typeof productData.images === "string"
            ? JSON.parse(productData.images)
            : productData.images,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products for AllProductPage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get new arrivals (sorted by createdAt, limited to 4)
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "price",
        "images",
        "categoryId",
        "averageRatings",
        "combos",
        "createdAt",
      ],
      include: [
        {
          model: Category,
          attributes: ["name"],
          as: "Category",
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 4,
    });

    // Transform the response to match frontend expectations
    const formattedProducts = products.map((item) => {
      const productData = item.toJSON();
      return {
        ...productData,
        images:
          typeof productData.images === "string"
            ? JSON.parse(productData.images)
            : productData.images,
        category: productData.Category ? productData.Category.name : "-",
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse images if it's a string
    let images = product.images;
    if (typeof product.images === "string") {
      try {
        images = JSON.parse(product.images);
      } catch (error) {
        console.error("Error parsing images:", error);
        images = [];
      }
    }

    // Ensure images is an array before using forEach
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "../", imagePath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (err) {
            console.error(`Error deleting image ${imagePath}:`, err);
          }
        }
      });
    }

    // Delete the product
    await product.destroy();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    // Find category by name (case-insensitive)
    const category = await Category.findOne({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Fetch products for the category
    const products = await Product.findAll({
      where: { categoryId: category.id },
      attributes: [
        "id",
        "name",
        "price",
        "images",
        "categoryId",
        "averageRatings",
        "combos",
      ],
      include: [
        {
          model: Category,
          attributes: ["name"],
          as: "Category",
        },
      ],
    });

    // Transform the response
    const formattedProducts = products.map((item) => {
      const productData = item.toJSON();
      return {
        ...productData,
        images:
          typeof productData.images === "string"
            ? JSON.parse(productData.images)
            : productData.images,
        category: productData.Category ? productData.Category.name : "-",
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/productController.js
exports.getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Product.findAll({
      attributes: [
        "id",
        "name",
        "price",
        "images",
        "categoryId",
        "averageRatings",
        "combos",
      ],
      include: [
        {
          model: Category,
          attributes: ["name"],
          as: "Category",
        },
        {
          model: OrderItem,
          attributes: [],
          as: "OrderItems",
          required: true,
        },
      ],
      group: ["Product.id", "Category.id"],
      order: [
        [sequelize.fn("SUM", sequelize.col("OrderItems.quantity")), "DESC"],
      ],
      limit: 4,
      raw: true,
      subQuery: false,
    });

    // Transform the response to match frontend expectations
    const formattedProducts = bestSellers.map((item) => {
      // Parse images if it's a string
      let parsedImages = item.images;
      if (typeof item.images === "string") {
        try {
          parsedImages = JSON.parse(item.images);
        } catch (e) {
          console.error("Error parsing images:", e);
          parsedImages = [];
        }
      }

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        image: parsedImages && parsedImages.length > 0 ? parsedImages[0] : "", // Use first image
        category: item["Category.name"] || "-",
        averageRatings: item.averageRatings,
        combos: item.combos,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
