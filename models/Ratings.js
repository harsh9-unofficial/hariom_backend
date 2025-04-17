const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");
const User = require("./User");

const Rating = sequelize.define(
  "Rating",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "ratings",
  }
);

Rating.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Rating, { foreignKey: "productId" });

Rating.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Rating, { foreignKey: "userId" });

// Sync Category table first
(async () => {
  await Product.sync();
  await User.sync();
  await Rating.sync();
})();

module.exports = Rating;
