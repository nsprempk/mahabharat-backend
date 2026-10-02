import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 18,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    englishTitle: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Simple Hindi explanation/summary of the chapter
    hindiMeaning: {
      type: String,
      default: "",
      trim: true,
    },

    verseCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    coverImageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    theme: {
      type: String,
      default: "",
      trim: true,
    },

    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Chapter", chapterSchema);
