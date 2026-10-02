import Verse from "../models/Verse.js";

/*
|--------------------------------------------------------------------------
| GET ALL VERSES OF A CHAPTER
|--------------------------------------------------------------------------
| GET /api/verses/chapter/:chapterNumber
|--------------------------------------------------------------------------
*/

export const getChapterVerses = async (req, res) => {
  try {
    const chapterNumber = Number(req.params.chapterNumber);

    if (
      !Number.isInteger(chapterNumber) ||
      chapterNumber < 1 ||
      chapterNumber > 18
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid chapter number",
      });
    }

    const verses = await Verse.find({
      chapterNumber,
    })
      .sort({
        verseNumber: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      chapterNumber,
      count: verses.length,
      verses,
    });
  } catch (error) {
    console.error("Get chapter verses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load chapter verses",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE VERSE
|--------------------------------------------------------------------------
| GET /api/verses/chapter/:chapterNumber/verse/:verseNumber
|--------------------------------------------------------------------------
*/

export const getVerse = async (req, res) => {
  try {
    const chapterNumber = Number(req.params.chapterNumber);

    const verseNumber = Number(req.params.verseNumber);

    if (
      !Number.isInteger(chapterNumber) ||
      chapterNumber < 1 ||
      chapterNumber > 18
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid chapter number",
      });
    }

    if (!Number.isInteger(verseNumber) || verseNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid verse number",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Current verse
    |--------------------------------------------------------------------------
    */

    const verse = await Verse.findOne({
      chapterNumber,
      verseNumber,
    }).lean();

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: `Chapter ${chapterNumber}, Verse ${verseNumber} not found`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Previous verse
    |--------------------------------------------------------------------------
    */

    const previousVerse = await Verse.findOne({
      chapterNumber,
      verseNumber: {
        $lt: verseNumber,
      },
    })
      .sort({
        verseNumber: -1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Next verse
    |--------------------------------------------------------------------------
    */

    const nextVerse = await Verse.findOne({
      chapterNumber,
      verseNumber: {
        $gt: verseNumber,
      },
    })
      .sort({
        verseNumber: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | First and last verse numbers
    |--------------------------------------------------------------------------
    */

    const firstVerse = await Verse.findOne({
      chapterNumber,
    })
      .sort({
        verseNumber: 1,
      })
      .select({
        verseNumber: 1,
      })
      .lean();

    const lastVerse = await Verse.findOne({
      chapterNumber,
    })
      .sort({
        verseNumber: -1,
      })
      .select({
        verseNumber: 1,
      })
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Chapter verse count
    |--------------------------------------------------------------------------
    */

    const verseCount = await Verse.countDocuments({
      chapterNumber,
    });

    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */

    const progress =
      verseCount > 0 ? Math.round((verseNumber / verseCount) * 100) : 0;

    return res.status(200).json({
      success: true,

      chapterNumber,

      verseNumber,

      verseCount,

      progress,

      firstVerseNumber: firstVerse?.verseNumber || 1,

      lastVerseNumber: lastVerse?.verseNumber || verseCount,

      verse,

      previousVerse,

      nextVerse,
    });
  } catch (error) {
    console.error("Get verse error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load verse",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SEARCH VERSES
|--------------------------------------------------------------------------
| GET /api/search?q=धर्म
|--------------------------------------------------------------------------
*/

export const searchVerses = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        count: 0,
        verses: [],
      });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escapedQuery, "i");

    const verses = await Verse.find({
      $or: [
        {
          sanskrit: regex,
        },
        {
          transliteration: regex,
        },
        {
          hindiMeaning: regex,
        },
      ],
    })
      .sort({
        chapterNumber: 1,
        verseNumber: 1,
      })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: verses.length,
      verses,
    });
  } catch (error) {
    console.error("Search verses error:", error);

    return res.status(500).json({
      success: false,
      message: "श्लोक खोजने में समस्या हुई।",
    });
  }
};
