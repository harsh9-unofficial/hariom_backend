const Product = require("../models/Product");
const Category = require("../models/Category");
const path = require("path");
const fs = require("fs");

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

    // Parse features (comes as JSON string from frontend)
    let parsedFeatures = [];
    try {
      parsedFeatures = JSON.parse(features);
      if (!Array.isArray(parsedFeatures)) {
        throw new Error("Features must be an array");
      }
    } catch (e) {
      return res.status(400).json({ message: "Invalid features format" });
    }

    // Parse howToUse (comes as JSON string from frontend)
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
      averageRatings: 0, // Default value as per model
      totalReviews: 0, // Default value as per model
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

    // Handle images (keep existing if no new ones uploaded)
    let imagePaths = product.images;
    if (req.files && req.files.length > 0) {
      // Delete old images from filesystem
      if (Array.isArray(product.images)) {
        product.images.forEach((imagePath) => {
          const fullPath = path.join(__dirname, "../", imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      // Add new images
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
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
