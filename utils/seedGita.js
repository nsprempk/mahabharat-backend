import dotenv from "dotenv";
import mongoose from "mongoose";

import Chapter from "../models/Chapter.js";
import Verse from "../models/Verse.js";

import {
  gitaContent,
  gitaChapters,
  verses,
  printGitaStats,
} from "./gitaData/gitaContent.js";

dotenv.config();

const seedGita = async () => {
  try {
    console.log("");
    console.log("==========================================");
    console.log("        MAHABHARAT - GITA SEED");
    console.log("==========================================");
    console.log("");

    // --------------------------------------------------
    // Environment check
    // --------------------------------------------------

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    // --------------------------------------------------
    // Content validation
    // --------------------------------------------------

    if (!Array.isArray(gitaChapters)) {
      throw new Error("gitaChapters must be an array");
    }

    if (!Array.isArray(verses)) {
      throw new Error("verses must be an array");
    }

    if (gitaChapters.length !== 18) {
      throw new Error(`Expected 18 chapters, found ${gitaChapters.length}`);
    }

    if (verses.length === 0) {
      throw new Error("No verse records found in gitaContent.js");
    }

    // --------------------------------------------------
    // Check chapter numbers
    // --------------------------------------------------

    const chapterNumbers = new Set(
      gitaChapters.map((chapter) => Number(chapter.number)),
    );

    for (let number = 1; number <= 18; number++) {
      if (!chapterNumbers.has(number)) {
        throw new Error(`Chapter ${number} is missing from gitaChapters`);
      }
    }

    // --------------------------------------------------
    // Check duplicate verses
    // --------------------------------------------------

    const verseKeys = new Set();
    const duplicateVerses = [];

    for (const verse of verses) {
      const chapterNumber = Number(verse.chapterNumber);

      const verseNumber = Number(verse.verseNumber);

      if (
        !Number.isInteger(chapterNumber) ||
        chapterNumber < 1 ||
        chapterNumber > 18
      ) {
        throw new Error(
          `Invalid chapter number in verse: ${verse.chapterNumber}`,
        );
      }

      if (!Number.isInteger(verseNumber) || verseNumber < 1) {
        throw new Error(
          `Invalid verse number in chapter ${chapterNumber}: ${verse.verseNumber}`,
        );
      }

      if (typeof verse.sanskrit !== "string" || !verse.sanskrit.trim()) {
        throw new Error(
          `Sanskrit text missing for Chapter ${chapterNumber}, Verse ${verseNumber}`,
        );
      }

      const key = `${chapterNumber}-${verseNumber}`;

      if (verseKeys.has(key)) {
        duplicateVerses.push(key);
      }

      verseKeys.add(key);
    }

    if (duplicateVerses.length > 0) {
      throw new Error(`Duplicate verses found: ${duplicateVerses.join(", ")}`);
    }

    // --------------------------------------------------
    // Connect MongoDB
    // --------------------------------------------------

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✓ MongoDB connected");

    // --------------------------------------------------
    // Show content statistics
    // --------------------------------------------------

    printGitaStats();

    // --------------------------------------------------
    // Clear old Gita data
    // --------------------------------------------------

    console.log("Removing old Gita verses...");

    await Verse.deleteMany({});

    console.log("✓ Old verses removed");

    console.log("Removing old Gita chapters...");

    await Chapter.deleteMany({});

    console.log("✓ Old chapters removed");

    // --------------------------------------------------
    // Prepare chapter records
    // --------------------------------------------------

    const chapterRecords = gitaChapters.map((chapter) => ({
      number: chapter.number,
      title: chapter.title,
      englishTitle: chapter.englishTitle || "",
      description: chapter.description || "",
      verseCount: Number(chapter.verseCount) || 0,

      imageUrl: chapter.imageUrl || "",

      coverImageUrl: chapter.coverImageUrl || "",

      theme: chapter.theme || "",

      seoTitle: chapter.seoTitle || "",

      seoDescription: chapter.seoDescription || "",

      // This field will be stored only when
      // hindiMeaning exists in Chapter schema.
      hindiMeaning: chapter.hindiMeaning || "",
    }));

    // --------------------------------------------------
    // Insert chapters
    // --------------------------------------------------

    await Chapter.insertMany(chapterRecords, {
      ordered: true,
    });

    console.log(`✓ Inserted ${chapterRecords.length} chapters`);

    // --------------------------------------------------
    // Prepare verse records
    // --------------------------------------------------

    const verseRecords = verses.map((verse) => ({
      chapterNumber: Number(verse.chapterNumber),

      verseNumber: Number(verse.verseNumber),

      sanskrit: verse.sanskrit?.trim() || "",

      transliteration: verse.transliteration?.trim() || "",

      hindiMeaning: verse.hindiMeaning?.trim() || "",

      englishMeaning: verse.englishMeaning?.trim() || "",

      imageUrl: verse.imageUrl || "",

      audioSanskritUrl: verse.audioSanskritUrl || "",

      audioMeaningUrl: verse.audioMeaningUrl || "",

      tags: Array.isArray(verse.tags) ? verse.tags : [],

      isFeatured: Boolean(verse.isFeatured),
    }));

    // --------------------------------------------------
    // Insert verses
    // --------------------------------------------------

    await Verse.insertMany(verseRecords, {
      ordered: true,
    });

    console.log(`✓ Inserted ${verseRecords.length} verses`);

    // --------------------------------------------------
    // Verify database
    // --------------------------------------------------

    const storedChapterCount = await Chapter.countDocuments();

    const storedVerseCount = await Verse.countDocuments();

    console.log("");
    console.log("==========================================");
    console.log("           DATABASE VERIFICATION");
    console.log("==========================================");

    console.log(`Chapters in database : ${storedChapterCount}`);

    console.log(`Verses in database   : ${storedVerseCount}`);

    console.log("==========================================");

    // --------------------------------------------------
    // Verify every chapter's verse count
    // --------------------------------------------------

    console.log("");
    console.log("Chapter verification:");
    console.log("");

    let calculatedTotal = 0;

    for (const chapter of chapterRecords) {
      const actualCount = await Verse.countDocuments({
        chapterNumber: chapter.number,
      });

      calculatedTotal += actualCount;

      const expectedCount = Number(chapter.verseCount) || 0;

      const status = actualCount === expectedCount ? "✓" : "⚠";

      console.log(
        `${status} Chapter ${String(chapter.number).padStart(
          2,
          "0",
        )} → ${actualCount}/${expectedCount}`,
      );
    }

    // --------------------------------------------------
    // Compare totals
    // --------------------------------------------------

    console.log("");
    console.log("==========================================");
    console.log("             FINAL SUMMARY");
    console.log("==========================================");

    console.log(`Chapters expected : 18`);

    console.log(`Chapters stored   : ${storedChapterCount}`);

    console.log(`Verses loaded     : ${verseRecords.length}`);

    console.log(`Verses stored     : ${storedVerseCount}`);

    console.log(`Total verified    : ${calculatedTotal}`);

    console.log(`Content title     : ${gitaContent.title}`);

    // --------------------------------------------------
    // Final status
    // --------------------------------------------------

    if (storedChapterCount !== 18) {
      throw new Error(
        `Chapter verification failed: expected 18, found ${storedChapterCount}`,
      );
    }

    if (storedVerseCount !== verseRecords.length) {
      throw new Error(
        `Verse verification failed: expected ${verseRecords.length}, found ${storedVerseCount}`,
      );
    }

    console.log("");
    console.log("==========================================");
    console.log("        GITA SEED COMPLETED");
    console.log("==========================================");

    console.log(`✓ ${storedChapterCount} chapters`);

    console.log(`✓ ${storedVerseCount} verses`);

    console.log("✓ MongoDB verification completed");

    console.log("==========================================");

    // --------------------------------------------------
    // Disconnect
    // --------------------------------------------------

    await mongoose.disconnect();

    console.log("✓ MongoDB disconnected");

    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error("            GITA SEED FAILED");
    console.error("==========================================");

    console.error(error.message || error);

    console.error("==========================================");

    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect error
    }

    process.exit(1);
  }
};

seedGita();
