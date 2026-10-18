import "dotenv/config";
import mongoose from "mongoose";

import Chapter from "../models/Chapter.js";
import Verse from "../models/Verse.js";

const EXPECTED_CHAPTER_COUNT = 18;
const EXPECTED_TOTAL_VERSES = 700;
const CHAPTER_NUMBER = 13;
const EXPECTED_VERSE_COUNT = 34;
const CURRENT_METADATA_COUNT = 35;

async function main() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is missing from backend/.env. No changes were made.",
    );
  }

  await mongoose.connect(mongoUri);

  try {
    // Safety checks: verify the database before making any changes.
    const [chapterTotal, totalVerses, actualChapterVerses, chapter] =
      await Promise.all([
        Chapter.countDocuments(),
        Verse.countDocuments(),
        Verse.countDocuments({
          chapterNumber: CHAPTER_NUMBER,
        }),
        Chapter.findOne({
          number: CHAPTER_NUMBER,
        })
          .select("number title verseCount")
          .lean(),
      ]);

    console.log("Read-only database checks:");
    console.log({
      chapterTotal,
      totalVerses,
      chapterNumber: CHAPTER_NUMBER,
      actualChapterVerses,
      currentMetadataCount: chapter?.verseCount ?? null,
    });

    if (chapterTotal !== EXPECTED_CHAPTER_COUNT) {
      throw new Error(
        `Expected 18 chapters but found ${chapterTotal}. Aborting.`,
      );
    }

    if (totalVerses !== EXPECTED_TOTAL_VERSES) {
      throw new Error(
        `Expected 700 verses but found ${totalVerses}. Aborting.`,
      );
    }

    if (!chapter) {
      throw new Error("Chapter 13 was not found. Aborting.");
    }

    if (actualChapterVerses !== EXPECTED_VERSE_COUNT) {
      throw new Error(
        `Expected 34 Chapter 13 verses but found ${actualChapterVerses}. Aborting.`,
      );
    }

    if (chapter.verseCount === EXPECTED_VERSE_COUNT) {
      console.log("Chapter 13 metadata is already correct. No changes needed.");
      return;
    }

    if (chapter.verseCount !== CURRENT_METADATA_COUNT) {
      throw new Error(
        `Expected metadata count 35 but found ${chapter.verseCount}. Aborting.`,
      );
    }

    // Update exactly one Chapter document; never modify verse records.
    const result = await Chapter.updateOne(
      {
        number: CHAPTER_NUMBER,
        verseCount: CURRENT_METADATA_COUNT,
      },
      {
        $set: {
          verseCount: EXPECTED_VERSE_COUNT,
        },
      },
    );

    if (result.modifiedCount !== 1) {
      throw new Error(
        "Exactly one chapter record was not updated. Check the database.",
      );
    }

    // Verify the correction.
    const updatedChapter = await Chapter.findOne({
      number: CHAPTER_NUMBER,
    })
      .select("number title verseCount")
      .lean();

    const verifiedVerseCount = await Verse.countDocuments({
      chapterNumber: CHAPTER_NUMBER,
    });

    if (
      updatedChapter?.verseCount !== EXPECTED_VERSE_COUNT ||
      verifiedVerseCount !== EXPECTED_VERSE_COUNT
    ) {
      throw new Error(
        "Post-update verification failed. Inspect the database before retrying.",
      );
    }

    console.log("\nSUCCESS: Chapter 13 metadata corrected.");
    console.log({
      chapterNumber: updatedChapter.number,
      title: updatedChapter.title,
      verseCount: updatedChapter.verseCount,
      actualVerseRecords: verifiedVerseCount,
      verseRecordsModified: 0,
    });
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("\nCorrection failed:", error.message);
  process.exitCode = 1;

  if (mongoose.connection.readyState !== 0) {
    mongoose.disconnect().catch(() => {});
  }
});
