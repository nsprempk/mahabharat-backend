import mongoose from "mongoose";

const wordMeaningSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

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

    // New educational content fields

    wordMeanings: {
      type: [wordMeaningSchema],
      default: [],
    },

    contextHindi: {
      type: String,
      default: "",
      trim: true,
    },

    explanationHindi: {
      type: String,
      default: "",
      trim: true,
    },

    keyTeachingHindi: {
      type: String,
      default: "",
      trim: true,
    },

    lifeApplicationHindi: {
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
