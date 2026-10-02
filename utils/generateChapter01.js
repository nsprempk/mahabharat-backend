import fs from "fs";
import https from "https";

const SOURCE_URL =
  "https://raw.githubusercontent.com/gita/gita/main/data/verse.json";

const outputFile = "./utils/gitaData/chapter01.js";

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode !== 200) {
            reject(new Error(`Download failed: HTTP ${response.statusCode}`));
            return;
          }

          resolve(data);
        });
      })
      .on("error", reject);
  });
}

function cleanSanskrit(text) {
  return text
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s*॥\s*\d+\.\d+\s*॥/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function generate() {
  try {
    console.log("Downloading Bhagavad Gita dataset...");

    const raw = await download(SOURCE_URL);

    const verses = JSON.parse(raw);

    const chapter01 = verses
      .filter((verse) => Number(verse.chapter_number) === 1)
      .sort((a, b) => Number(a.verse_number) - Number(b.verse_number))
      .map((verse) => ({
        chapterNumber: 1,

        verseNumber: Number(verse.verse_number),

        sanskrit: cleanSanskrit(verse.text),

        transliteration: verse.transliteration?.trim() || "",

        hindiMeaning: "इस श्लोक का सरल हिंदी अर्थ शीघ्र जोड़ा जाएगा।",

        englishMeaning: "",

        imageUrl: "",

        audioSanskritUrl: "",

        audioMeaningUrl: "",

        tags: [],

        isFeatured: false,
      }));

    if (chapter01.length !== 47) {
      throw new Error(`Expected 47 verses, but found ${chapter01.length}`);
    }

    const fileContent = `const chapter01 = ${JSON.stringify(
      chapter01,
      null,
      2,
    )};

export default chapter01;
`;

    fs.writeFileSync(outputFile, fileContent, "utf8");

    console.log("");
    console.log("================================");
    console.log("CHAPTER 1 GENERATED SUCCESSFULLY");
    console.log("================================");
    console.log(`Verses: ${chapter01.length}`);
    console.log(`File: ${outputFile}`);
    console.log("================================");
  } catch (error) {
    console.error("Generation failed:");

    console.error(error);

    process.exit(1);
  }
}

generate();
