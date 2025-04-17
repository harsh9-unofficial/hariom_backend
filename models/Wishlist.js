const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");

const Wishlist = Sequelize.define(
  "Wishlist",
  {
    cartId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },

    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
  },
  {
    tableName: "wishlist",
    timestamps: true,
  }
);

Wishlist.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Wishlist, { foreignKey: "productId" });

Wishlist.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Wishlist, { foreignKey: "userId" });

// Sync Category table first
(async () => {
  await Product.sync();
  await User.sync();
  await Wishlist.sync();
})();

module.exports = Wishlist;
