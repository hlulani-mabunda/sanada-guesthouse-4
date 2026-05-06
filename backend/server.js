const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const houseRoutes = require("./routes/houseRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const seedHouses = require("./config/seedHouses");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/bookings", bookingRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Sadana Guesthouse API running...");
});

// Global Error Handler (Recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong!" 
  });
});

// Connect to MongoDB and seed data
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log(" MongoDB Connected Successfully");
    
    // Run seeding only once after connection
    try {
      await seedHouses();
      console.log("House seeding completed");
    } catch (seedErr) {
      console.error(" Seeding failed:", seedErr.message);
      // Don't crash the server if seeding fails
    }
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1); // Exit if DB connection fails (critical)
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

// Graceful shutdown (good practice)
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});