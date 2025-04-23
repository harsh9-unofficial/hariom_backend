const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");
const User = require("./User");

const Order = Sequelize.define(
  "Order", // Model name should be capitalized for consistency
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingCharge: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "1-pending, 2-processing, 3-shipped, 4-delivered, 5-cancelled",
    },
  },
  {
    tableName: "order",
    timestamps: true,
  }
);

// Correct associations
Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });


module.exports = Order;
