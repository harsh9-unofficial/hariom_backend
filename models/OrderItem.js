const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");
const Order = require("./Order");
const Product = require("./Product");

const OrderItem = Sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
Order.hasMany(OrderItem, { foreignKey: "orderId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });

// Sync Category table first
(async () => {
  await Product.sync();
  await Order.sync();
  await OrderItem.sync();
})();

module.exports = OrderItem;