const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    howToUse: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Features must be an array");
          }
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Features must be an array");
          }
        },
      },
    },
    suitableSurfaces: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Images must be an array");
          }
        },
      },
    },
    volume: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    ingredients: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    scent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phLevel: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 14,
      },
    },
    shelfLife: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    madeIn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    packaging: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    averageRatings: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalReviews: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    combos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "products",
  }
);

Product.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Product, { foreignKey: "categoryId" });

// Sync Category table first
(async () => {
  await Category.sync();
  await Product.sync();
})();

module.exports = Product;
