const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your sequelize instance

const Contact = sequelize.define(
  "Contacts",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },         
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Store createdAt and updatedAt automatically
    tableName: "contacts", // Ensure the table name is correct
  }
);

module.exports = Contact;
