import express from "express";
import Book from "../models/Book.js";
import Review from "../models/Review.js";
import mongoose from "mongoose"; // Import mongoose
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /books
// @desc    Add a new book
// @access  Private
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, author, genre, description, publishedYear, isbn } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description,
      publishedYear,
      isbn,
      createdBy: req.user._id,
    });

    await book.save();

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /books
// @desc    Get all books with pagination and filters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: "i" };
    }

    if (req.query.genre) {
      filter.genre = { $regex: req.query.genre, $options: "i" };
    }

    // Get books
    const books = await Book.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Book.countDocuments(filter);

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

// @route   GET /books/:id
// @desc    Get book details by ID with reviews
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get book
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Get reviews with pagination
    const reviews = await Review.find({ book: req.params.id })
      .populate("user", "username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total reviews count
    const totalReviews = await Review.countDocuments({ book: req.params.id });

    // Calculate average rating
    const ratingResult = await Review.aggregate([
      {
        $match: {
          book: mongoose.Types.ObjectId.createFromHexString(req.params.id),
        },
      },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    const averageRating =
      ratingResult.length > 0
        ? Number.parseFloat(ratingResult[0].averageRating.toFixed(1))
        : 0;

    res.json({
      book,
      reviews,
      averageRating,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /books/:id/reviews
// @desc    Submit a review for a book
// @access  Private
router.post("/:id/reviews", authenticate, async (req, res) => {
  try {
    const { rating, text } = req.body;

    // Check if book exists
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      book: req.params.id,
      user: req.user._id,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this book" });
    }

    // Create review
    const review = new Review({
      book: req.params.id,
      user: req.user._id,
      rating,
      text,
    });

    await review.save();

    // Populate user info
    await review.populate("user", "username");

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
