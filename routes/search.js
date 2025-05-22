import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

// @route   GET /search
// @desc    Search books by title or author
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search by title or author
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Book.countDocuments({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
      ],
    });

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalBooks: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
