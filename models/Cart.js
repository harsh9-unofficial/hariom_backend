const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");

const Cart = Sequelize.define(
  "cart",
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
        key: "id", // correct, if User uses 'id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id", // correct, if Product uses 'id'
      },
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "cart",
    timestamps: true,
  }
);

Cart.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Cart, { foreignKey: "productId" });

Cart.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Cart, { foreignKey: "userId" });

// Sync Category table first
(async () => {
  await Product.sync();
  await User.sync();
  await Cart.sync();
})();

module.exports = Cart;
