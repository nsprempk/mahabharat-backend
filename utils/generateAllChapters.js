import fs from "fs";

const SOURCE_URL = "https://gitabhawan.org.in/data/gita-corpus.json";

const outputDir = "./utils/gitaData";

const expectedVerses = {
  1: 47,
  2: 72,
  3: 43,
  4: 42,
  5: 29,
  6: 47,
  7: 30,
  8: 28,
  9: 34,
  10: 42,
  11: 55,
  12: 20,
  13: 34,
  14: 27,
  15: 20,
  16: 24,
  17: 28,
  18: 78,
};

const totalExpectedVerses = 700;

/*
|--------------------------------------------------------------------------
| Chapter Hindi Summaries
|--------------------------------------------------------------------------
|
| These are the longer chapter descriptions used by your application.
| The individual verse Hindi meanings come from the verified corpus.
|
*/

const chapterHindiMeanings = {
  1: "इस अध्याय में कुरुक्षेत्र के युद्धक्षेत्र में अर्जुन अपने स्वजनों, गुरुजनों और संबंधियों को सामने देखकर मोह तथा विषाद से भर जाते हैं। वे युद्ध करने से हिचकते हैं और अपने कर्तव्य तथा धर्म को लेकर गहरी दुविधा में पड़ जाते हैं।",

  2: "इस अध्याय में श्रीकृष्ण अर्जुन को आत्मा की अमरता, शरीर की नश्वरता, कर्तव्य, कर्मयोग, ज्ञान और समत्व का उपदेश देते हैं। यह अध्याय भगवद्गीता के मूल आध्यात्मिक सिद्धांतों की आधारभूमि प्रस्तुत करता है।",

  3: "इस अध्याय में श्रीकृष्ण कर्मयोग का महत्व समझाते हैं। मनुष्य को अपने कर्तव्य का पालन आसक्ति रहित होकर करना चाहिए और कर्म के फल को परमात्मा को समर्पित करना चाहिए।",

  4: "इस अध्याय में दिव्य ज्ञान, कर्म, अकर्म तथा भगवान के अवतार का रहस्य बताया गया है। श्रीकृष्ण समझाते हैं कि धर्म की रक्षा और अधर्म के विनाश के लिए वे युग-युग में प्रकट होते हैं।",

  5: "इस अध्याय में कर्मसंन्यास और कर्मयोग की तुलना करते हुए बताया गया है कि निष्काम भाव से कर्म करना मुक्ति की ओर ले जाता है। सच्चा संन्यास कर्म का त्याग नहीं बल्कि कर्मफल की आसक्ति का त्याग है।",

  6: "इस अध्याय में ध्यानयोग और मन के संयम का वर्णन है। श्रीकृष्ण बताते हैं कि अभ्यास और वैराग्य के द्वारा मन को नियंत्रित करके योगी आत्मिक शांति और परमात्मा की अनुभूति प्राप्त कर सकता है।",

  7: "इस अध्याय में भगवान अपने स्वरूप, प्रकृति, माया और अपनी दिव्य शक्ति का ज्ञान देते हैं। भक्तिभाव से भगवान को जानने और उन्हें प्राप्त करने का मार्ग समझाया गया है।",

  8: "इस अध्याय में ब्रह्म, अध्यात्म, कर्म और मृत्यु के समय भगवान के स्मरण का महत्व बताया गया है। भगवान को स्मरण करते हुए शरीर छोड़ने वाले साधक की परम गति का वर्णन मिलता है।",

  9: "इस अध्याय में राजविद्या और राजगुह्य अर्थात सर्वोच्च ज्ञान और परम रहस्य का वर्णन है। भगवान बताते हैं कि निष्काम और अनन्य भक्ति के द्वारा मनुष्य उन्हें प्राप्त कर सकता है।",

  10: "इस अध्याय में श्रीकृष्ण अपनी दिव्य विभूतियों का वर्णन करते हैं। संसार में जो कुछ श्रेष्ठ, शक्तिशाली और दिव्य है, उसे भगवान की महिमा की अभिव्यक्ति के रूप में समझाया गया है।",

  11: "इस अध्याय में अर्जुन भगवान श्रीकृष्ण के विराट विश्वरूप का दर्शन करते हैं। उन्हें सम्पूर्ण ब्रह्मांड एक ही दिव्य स्वरूप में दिखाई देता है और वे भगवान की अनंत शक्ति का अनुभव करते हैं।",

  12: "इस अध्याय में भक्ति योग का महत्व बताया गया है। भगवान अपने प्रिय भक्त के गुण बताते हैं और समझाते हैं कि प्रेम, श्रद्धा, समर्पण तथा निष्काम भक्ति से परमात्मा की प्राप्ति संभव है।",

  13: "इस अध्याय में क्षेत्र और क्षेत्रज्ञ अर्थात शरीर और उसके ज्ञाता के स्वरूप को समझाया गया है। प्रकृति, पुरुष, ज्ञान और परमात्मा के संबंध का विस्तृत वर्णन किया गया है।",

  14: "इस अध्याय में प्रकृति के तीन गुणों—सत्त्व, रज और तम—का वर्णन किया गया है। मनुष्य इन गुणों से कैसे बंधता है और इनसे ऊपर उठकर परम अवस्था को कैसे प्राप्त कर सकता है, यह समझाया गया है।",

  15: "इस अध्याय में संसार को अश्वत्थ वृक्ष के रूपक से समझाया गया है। जीवात्मा, परमात्मा और पुरुषोत्तम भगवान के वास्तविक स्वरूप का वर्णन करते हुए परम सत्य की ओर ले जाने वाला ज्ञान दिया गया है।",

  16: "इस अध्याय में दैवी और आसुरी संपदाओं का वर्णन किया गया है। मनुष्य के गुण, आचरण और विचार उसके आध्यात्मिक विकास तथा पतन में किस प्रकार भूमिका निभाते हैं, यह समझाया गया है।",

  17: "इस अध्याय में श्रद्धा के तीन प्रकार—सात्त्विक, राजसिक और तामसिक—का वर्णन किया गया है। भोजन, यज्ञ, तप और दान भी इन तीन गुणों के अनुसार अलग-अलग प्रकार के बताए गए हैं।",

  18: "यह भगवद्गीता का अंतिम अध्याय है। इसमें कर्म, ज्ञान, त्याग, संन्यास, भक्ति और मोक्ष के विभिन्न सिद्धांतों को समाहित करके श्रीकृष्ण अर्जुन को अंतिम उपदेश देते हैं और परम शरणागति का मार्ग बताते हैं।",
};

/*
|--------------------------------------------------------------------------
| Download JSON
|--------------------------------------------------------------------------
*/

async function downloadJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Download failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| Clean text
|--------------------------------------------------------------------------
*/

function cleanText(text = "") {
  return String(text).replace(/\r/g, "").trim();
}

/*
|--------------------------------------------------------------------------
| Escape JS string
|--------------------------------------------------------------------------
*/

function toJs(value) {
  return JSON.stringify(value, null, 2);
}

/*
|--------------------------------------------------------------------------
| Main generator
|--------------------------------------------------------------------------
*/

async function generate() {
  try {
    console.log("");
    console.log("==================================================");
    console.log("      BHAGAVAD GITA 700 VERSE GENERATOR");
    console.log("==================================================");
    console.log("");

    console.log("Downloading verified Gita corpus...");

    const corpus = await downloadJson(SOURCE_URL);

    if (!corpus || typeof corpus !== "object") {
      throw new Error("Invalid corpus response.");
    }

    if (!Array.isArray(corpus.verses)) {
      throw new Error("Corpus does not contain a valid verses array.");
    }

    if (!Array.isArray(corpus.chapters)) {
      throw new Error("Corpus does not contain a valid chapters array.");
    }

    console.log(
      `Source reports ${corpus.counts?.verses ?? corpus.verses.length} verses.`,
    );

    /*
    |--------------------------------------------------------------------------
    | Verify total source count
    |--------------------------------------------------------------------------
    */

    if (corpus.verses.length !== totalExpectedVerses) {
      throw new Error(
        `Expected ${totalExpectedVerses} total verses, found ${corpus.verses.length}`,
      );
    }

    fs.mkdirSync(outputDir, {
      recursive: true,
    });

    let totalGenerated = 0;

    const generatedChapters = [];

    /*
    |--------------------------------------------------------------------------
    | Generate chapter files
    |--------------------------------------------------------------------------
    */

    for (let chapterNumber = 1; chapterNumber <= 18; chapterNumber++) {
      const sourceChapter = corpus.chapters.find(
        (chapter) => Number(chapter.n) === chapterNumber,
      );

      if (!sourceChapter) {
        throw new Error(`Chapter ${chapterNumber} metadata was not found.`);
      }

      const sourceVerses = corpus.verses
        .filter((verse) => Number(verse.chapter) === chapterNumber)
        .sort((a, b) => Number(a.verse) - Number(b.verse));

      const expectedCount = expectedVerses[chapterNumber];

      if (sourceVerses.length !== expectedCount) {
        throw new Error(
          `Chapter ${chapterNumber}: expected ${expectedCount} verses, found ${sourceVerses.length}`,
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Transform records for MongoDB
      |--------------------------------------------------------------------------
      */

      const chapterVerses = sourceVerses.map((verse) => ({
        chapterNumber: Number(verse.chapter),

        verseNumber: Number(verse.verse),

        sanskrit: cleanText(verse.sanskrit),

        transliteration: cleanText(verse.iast),

        /*
         * REAL HINDI MEANING
         */
        hindiMeaning: cleanText(verse.hindi),

        /*
         * Keep English empty because
         * your website is Hindi-focused.
         */
        englishMeaning: "",

        /*
         * Media will be added later.
         */
        imageUrl: "",

        audioSanskritUrl: "",

        audioMeaningUrl: "",

        tags: Array.isArray(verse.terms)
          ? verse.terms.map((term) => String(term))
          : [],

        isFeatured: false,
      }));

      /*
      |--------------------------------------------------------------------------
      | Validate every verse
      |--------------------------------------------------------------------------
      */

      for (const verse of chapterVerses) {
        if (!verse.sanskrit) {
          throw new Error(
            `Missing Sanskrit: Chapter ${chapterNumber}, Verse ${verse.verseNumber}`,
          );
        }

        if (!verse.hindiMeaning) {
          throw new Error(
            `Missing Hindi meaning: Chapter ${chapterNumber}, Verse ${verse.verseNumber}`,
          );
        }

        if (!verse.transliteration) {
          console.warn(
            `Warning: transliteration missing for Chapter ${chapterNumber}, Verse ${verse.verseNumber}`,
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Generate chapterXX.js
      |--------------------------------------------------------------------------
      */

      const chapterName = String(chapterNumber).padStart(2, "0");

      const variableName = `chapter${chapterName}`;

      const fileName = `${variableName}.js`;

      const filePath = `${outputDir}/${fileName}`;

      const fileContent = `const ${variableName} = ${toJs(chapterVerses)};

export default ${variableName};
`;

      fs.writeFileSync(filePath, fileContent, "utf8");

      /*
      |--------------------------------------------------------------------------
      | Chapter metadata
      |--------------------------------------------------------------------------
      */

      generatedChapters.push({
        number: chapterNumber,

        title: sourceChapter.sanskrit || "",

        englishTitle: sourceChapter.iast || "",

        sourceHindiTitle: sourceChapter.hindi || "",

        verseCount: expectedCount,

        hindiMeaning: chapterHindiMeanings[chapterNumber] || "",
      });

      totalGenerated += chapterVerses.length;

      console.log(`Chapter ${chapterNumber}: ${chapterVerses.length} verses ✓`);
    }

    /*
    |--------------------------------------------------------------------------
    | Final total check
    |--------------------------------------------------------------------------
    */

    if (totalGenerated !== totalExpectedVerses) {
      throw new Error(
        `Generated ${totalGenerated} verses, expected ${totalExpectedVerses}`,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate gitaContent.js
    |--------------------------------------------------------------------------
    */

    const chapterImports = Array.from({ length: 18 }, (_, index) => {
      const chapterNumber = index + 1;

      const chapterName = String(chapterNumber).padStart(2, "0");

      return `import chapter${chapterName} from "./chapter${chapterName}.js";`;
    }).join("\n");

    const chapterSpread = Array.from({ length: 18 }, (_, index) => {
      const chapterNumber = index + 1;

      const chapterName = String(chapterNumber).padStart(2, "0");

      return `  ...chapter${chapterName},`;
    }).join("\n");

    const chapterMetadata = generatedChapters.map((chapter) => ({
      number: chapter.number,

      title: chapter.title,

      englishTitle: chapter.englishTitle,

      sourceHindiTitle: chapter.sourceHindiTitle,

      verseCount: chapter.verseCount,

      hindiMeaning: chapter.hindiMeaning,
    }));

    const gitaContentFile = `import chapters from "./chapters.js";

${chapterImports}

/*
|--------------------------------------------------------------------------
| सभी अध्यायों का हिंदी परिचय
|--------------------------------------------------------------------------
*/

const chapterHindiMeanings = ${toJs(chapterHindiMeanings)};

/*
|--------------------------------------------------------------------------
| सभी श्लोक
|--------------------------------------------------------------------------
*/

const gitaVerses = [
${chapterSpread}
];

/*
|--------------------------------------------------------------------------
| अध्यायों की जानकारी
|--------------------------------------------------------------------------
*/

const gitaChapters = chapters.map(
  (chapter) => ({
    ...chapter,

    hindiMeaning:
      chapterHindiMeanings[
        chapter.number
      ] || "",
  })
);

/*
|--------------------------------------------------------------------------
| प्रत्येक श्लोक में अध्याय का हिंदी
| परिचय भी उपलब्ध रखें
|--------------------------------------------------------------------------
*/

const verses = gitaVerses.map(
  (verse) => ({
    ...verse,

    chapterHindiMeaning:
      chapterHindiMeanings[
        verse.chapterNumber
      ] || "",
  })
);

/*
|--------------------------------------------------------------------------
| मुख्य Gita Content
|--------------------------------------------------------------------------
*/

const gitaContent = {
  title: "श्रीमद्भगवद्गीता",

  titleEnglish:
    "Srimad Bhagavad Gita",

  chapterCount:
    gitaChapters.length,

  totalVerseCount:
    verses.length,

  chapters:
    gitaChapters,

  verses,
};

/*
|--------------------------------------------------------------------------
| आँकड़े
|--------------------------------------------------------------------------
*/

export const printGitaStats = () => {
  console.log("");
  console.log(
    "=================================================="
  );
  console.log(
    "            GITA CONTENT STATISTICS"
  );
  console.log(
    "=================================================="
  );

  console.log(
    \`Chapters: \${gitaChapters.length}\`
  );

  console.log(
    \`Verses: \${verses.length}\`
  );

  console.log("");

  for (const chapter of gitaChapters) {
    const count =
      verses.filter(
        (verse) =>
          verse.chapterNumber ===
          chapter.number
      ).length;

    console.log(
      \`Chapter \${String(
        chapter.number
      ).padStart(2, "0")}: \${count}/\${chapter.verseCount}\`
    );
  }

  console.log(
    "=================================================="
  );
  console.log("");
};

export {
  gitaContent,
  gitaChapters,
  verses,
  chapterHindiMeanings,
};

export default gitaContent;
`;

    fs.writeFileSync(`${outputDir}/gitaContent.js`, gitaContentFile, "utf8");

    /*
    |--------------------------------------------------------------------------
    | Print final result
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("==================================================");
    console.log("       GITA DATA GENERATED SUCCESSFULLY");
    console.log("==================================================");

    console.log(`Total chapters : 18`);

    console.log(`Total verses   : ${totalGenerated}`);

    console.log(`Expected       : ${totalExpectedVerses}`);

    console.log("Hindi meanings : ✓");

    console.log("Transliteration: ✓");

    console.log("Media fields   : Empty for later");

    console.log("==================================================");

    console.log("");
  } catch (error) {
    console.error("");
    console.error("==================================================");
    console.error("       GITA DATA GENERATION FAILED");
    console.error("==================================================");
    console.error(error.message || error);
    console.error("==================================================");

    process.exit(1);
  }
}

generate();
