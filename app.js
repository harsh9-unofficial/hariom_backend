const express = require("express");
const app = express();
const sequelize = require("./config/db");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const contactUsRoutes = require("./routes/contactUsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/contacts", contactUsRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ratings", ratingRoutes);

// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
