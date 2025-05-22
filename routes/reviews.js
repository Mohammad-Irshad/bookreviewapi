import express from "express";
import Review from "../models/Review.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// @route   PUT /reviews/:id
// @desc    Update a review
// @access  Private
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { rating, text } = req.body;

    // Find review
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    // Update review
    review.rating = rating || review.rating;
    review.text = text || review.text;

    await review.save();

    // Populate user info
    await review.populate("user", "username");

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /reviews/:id
// @desc    Delete a review
// @access  Private
router.delete("/:id", authenticate, async (req, res) => {
  try {
    // Find review
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    // Delete review
    await review.deleteOne();

    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
