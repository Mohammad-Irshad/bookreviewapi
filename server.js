import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import reviewRoutes from "./routes/reviews.js";
import searchRoutes from "./routes/search.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", searchRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Book Review API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
