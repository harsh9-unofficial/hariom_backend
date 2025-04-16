const Product = require("../models/Product");
const Category = require("../models/Category");
const path = require("path");
const fs = require("fs");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, categoryId, price, description, stock, features } = req.body;

    // Validate required fields
    if (!name || !categoryId || !price || !description) {
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

    // Handle uploaded images
    const imagePaths = req.files.map((file) =>
      path.join("uploads", file.filename).replace(/\\/g, "/")
    );

    // Validate category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create product
    const product = await Product.create({
      name,
      categoryId,
      price: parseFloat(price),
      description,
      stock: parseInt(stock) || 0,
      features: parsedFeatures,
      images: imagePaths,
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
    const { name, categoryId, price, description, stock, features } = req.body;

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

    // Handle images (keep existing if no new ones uploaded)
    let imagePaths = product.images;
    if (req.files && req.files.length > 0) {
      // Delete old images from filesystem
      product.images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "../", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
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

    // Update product
    await product.update({
      name: name || product.name,
      categoryId: categoryId || product.categoryId,
      price: price ? parseFloat(price) : product.price,
      description: description || product.description,
      stock: stock ? parseInt(stock) : product.stock,
      features: parsedFeatures,
      images: imagePaths,
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
          attributes: ["name"], // Only fetch the category name
          as: "Category", // Match the association alias defined in Product.js
        },
      ],
    });

    // Transform the response to flatten the category name
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      category: product.Category ? product.Category.name : "-", // Use category name
      description: product.description,
      price: product.price,
      stock: product.stock,
      features: product.features,
      images: product.images,
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
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
