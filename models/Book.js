import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    publishedYear: {
      type: Number,
    },
    isbn: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews
bookSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "book",
});

// Virtual for average rating
bookSchema.virtual("averageRating").get(function () {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce(
      (total, review) => total + review.rating,
      0
    );
    return (sum / this.reviews.length).toFixed(1);
  }
  return 0;
});

const Book = mongoose.model("Book", bookSchema);

export default Book;
