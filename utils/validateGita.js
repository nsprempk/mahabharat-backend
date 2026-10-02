import mongoose from "mongoose";
import dotenv from "dotenv";

import Chapter from "../models/Chapter.js";
import Verse from "../models/Verse.js";

dotenv.config();

const validateGita = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected\n");

    const chapters = await Chapter.find().sort({ number: 1 });

    let totalExpected = 0;
    let totalActual = 0;

    for (const chapter of chapters) {
      const actualCount = await Verse.countDocuments({
        chapterNumber: chapter.number,
      });

      totalExpected += chapter.verseCount;
      totalActual += actualCount;

      const status = actualCount === chapter.verseCount ? "✓" : "⚠";

      console.log(
        `${status} Chapter ${chapter.number}: ${actualCount}/${chapter.verseCount}`,
      );
    }

    console.log("\n-------------------------");

    console.log(`Expected verses: ${totalExpected}`);

    console.log(`Actual verses:   ${totalActual}`);

    console.log("-------------------------");

    if (totalExpected === totalActual) {
      console.log("✓ Complete verse count");
    } else {
      console.log("⚠ Dataset is not complete yet");
    }

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

validateGita();
