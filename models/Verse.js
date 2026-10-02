import mongoose from "mongoose";

const verseSchema = new mongoose.Schema(
  {
    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 18,
      index: true,
    },

    verseNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    sanskrit: {
      type: String,
      required: true,
      trim: true,
    },

    transliteration: {
      type: String,
      default: "",
      trim: true,
    },

    hindiMeaning: {
      type: String,
      default: "",
      trim: true,
    },

    englishMeaning: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    audioSanskritUrl: {
      type: String,
      default: "",
      trim: true,
    },

    audioMeaningUrl: {
      type: String,
      default: "",
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

verseSchema.index(
  {
    chapterNumber: 1,
    verseNumber: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("Verse", verseSchema);
