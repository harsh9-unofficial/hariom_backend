const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");
const Order = require("./Order");
const Product = require("./Product");

const OrderItem = Sequelize.define(
  "OrderItem", // Model name should be capitalized for consistency
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Typically, this shouldn't be null
      references: {
        model: Order,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Typically, this shouldn't be null
      references: {
        model: Product,
        key: "id",
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "orderitem",
    timestamps: true,
  }
);

// Define associations
OrderItem.belongsTo(Order, { foreignKey: "orderId" }); // Removed redundant alias
OrderItem.belongsTo(Product, { foreignKey: "productId" }); // Removed redundant alias
Order.hasMany(OrderItem, { foreignKey: "orderId" }); // Correct foreign key
Product.hasMany(OrderItem, { foreignKey: "productId" }); // Fixed foreign key

// Optional: Sync the model (remove nested sync unless necessary)
OrderItem.sync();

module.exports = OrderItem;