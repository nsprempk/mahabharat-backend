import "dotenv/config";
import mongoose from "mongoose";
import Verse from "../models/Verse.js";

const EXPECTED_TOTAL_VERSES = 700;
const EXPECTED_CHAPTER_TWO_VERSES = 72;
const TARGET_CHAPTER = 2;

// This script updates only educational fields for verses 2.1, 2.2, and 2.3.
// It never changes Sanskrit, transliteration, existing meanings, chapter data,
// or any other verse. It aborts if the target verses already contain any of
// the new educational fields, so reviewed content is never silently replaced.

const educationalContent = [
  {
    verseNumber: 1,
    wordMeanings: [
      { word: "तम्", meaning: "उस अर्जुन को" },
      { word: "तथा", meaning: "उस प्रकार या उस अवस्था में" },
      { word: "कृपया", meaning: "करुणा से" },
      { word: "आविष्टम्", meaning: "आक्रांत या पूरी तरह घिरा हुआ" },
      {
        word: "अश्रुपूर्णाकुलेक्षणम्",
        meaning: "जिसकी आँखें आँसुओं से भरी और व्याकुल थीं",
      },
      { word: "विषीदन्तम्", meaning: "शोक में डूबे हुए" },
      { word: "इदम्", meaning: "ये" },
      { word: "वाक्यम्", meaning: "वचन या बात" },
      { word: "उवाच", meaning: "कहा" },
      { word: "मधुसूदनः", meaning: "श्रीकृष्ण का एक नाम" },
    ],
    contextHindi:
      "पहले अध्याय में अर्जुन युद्धभूमि पर अपने संबंधियों, गुरुओं और मित्रों को सामने देखकर गहरे विषाद में पड़ जाते हैं। इस श्लोक में उनकी करुणा, आँसू और व्याकुलता का वर्णन है। इसके बाद श्रीकृष्ण उन्हें संबोधित करना आरंभ करते हैं।",
    explanationHindi:
      "यह श्लोक अर्जुन की तत्कालीन मनःस्थिति का चित्र प्रस्तुत करता है। वे केवल युद्ध को लेकर विचार नहीं कर रहे, बल्कि सामने खड़े अपने प्रियजनों के कारण भावनात्मक पीड़ा अनुभव कर रहे हैं। श्लोक उनकी आँखों में आँसू और मन में शोक होने की बात कहता है। यह वर्णन आगे होने वाले संवाद की पृष्ठभूमि तैयार करता है: अर्जुन की उलझन के उत्तर में श्रीकृष्ण उन्हें परिस्थिति, कर्तव्य और विवेक पर विचार करने के लिए संबोधित करेंगे।",
    keyTeachingHindi:
      "किसी कठिन निर्णय को समझने के लिए पहले यह पहचानना उपयोगी है कि उस समय हमारे मन में करुणा, भय, मोह या शोक में से क्या सक्रिय है।",
    lifeApplicationHindi:
      "जब भावनाएँ बहुत तीव्र हों, तो तुरंत निष्कर्ष निकालने के बजाय अपनी स्थिति को स्पष्ट रूप से पहचानें और किसी विवेकशील व्यक्ति से संवाद करें। भावनाओं को स्वीकार करना और फिर सोच-समझकर निर्णय लेना, दोनों साथ चल सकते हैं।",
  },
  {
    verseNumber: 2,
    wordMeanings: [
      { word: "कुतः", meaning: "कहाँ से" },
      { word: "त्वा", meaning: "तुम्हें या तुममें" },
      { word: "कश्मलम्", meaning: "मोह, भ्रम या मन की अवसन्न अवस्था" },
      { word: "इदम्", meaning: "यह" },
      { word: "विषमे", meaning: "इस कठिन या संकटपूर्ण समय में" },
      { word: "समुपस्थितम्", meaning: "आ उपस्थित हुआ" },
      { word: "अनार्यजुष्टम्", meaning: "उदात्त आचरण के अनुरूप नहीं" },
      { word: "अस्वर्ग्यम्", meaning: "उच्च कल्याण तक ले जाने वाला नहीं" },
      { word: "अकीर्तिकरम्", meaning: "अपकीर्ति का कारण बनने वाला" },
      { word: "अर्जुन", meaning: "हे अर्जुन" },
    ],
    contextHindi:
      "अर्जुन के विषाद को देखकर श्रीकृष्ण उनसे सीधे प्रश्न करते हैं। वे कठिन घड़ी में अर्जुन के मन पर छाए मोह और पीछे हटने की प्रवृत्ति को चुनौती देते हैं। यह संवाद अर्जुन को अपनी स्थिति पर नए दृष्टिकोण से विचार करने के लिए प्रेरित करता है।",
    explanationHindi:
      "श्रीकृष्ण पूछते हैं कि ऐसी निर्णायक घड़ी में यह मोह अर्जुन पर कैसे छा गया। ‘अनार्यजुष्टम्’, ‘अस्वर्ग्यम्’ और ‘अकीर्तिकरम्’ जैसे शब्दों से वे अर्जुन को याद दिलाते हैं कि उसके विचार और आचरण उसके घोषित मूल्यों तथा जिम्मेदारी के अनुरूप होने चाहिए। इस कथन का उद्देश्य अर्जुन को झकझोरना है, ताकि वह केवल तत्काल के शोक से संचालित न हो और परिस्थिति को विवेकपूर्वक देख सके।",
    keyTeachingHindi:
      "कठिन परिस्थिति में अपने निर्णय को केवल तत्काल की भावना से नहीं, बल्कि विवेक, मूल्यों और जिम्मेदारी के आधार पर भी परखना चाहिए।",
    lifeApplicationHindi:
      "किसी चुनौती से सामना होने पर स्वयं से पूछें: क्या मैं स्थिति को स्पष्ट रूप से देख रहा हूँ, या केवल डर और निराशा के प्रभाव में प्रतिक्रिया दे रहा हूँ? यह प्रश्न जल्दबाजी के बजाय जिम्मेदार निर्णय लेने में मदद कर सकता है।",
  },
  {
    verseNumber: 3,
    wordMeanings: [
      {
        word: "क्लैब्यम्",
        meaning: "यहाँ साहस खो देने या दुर्बल पड़ जाने की अवस्था",
      },
      { word: "मा स्म गमः", meaning: "मत अपनाओ या उसमें मत पड़ो" },
      { word: "पार्थ", meaning: "हे पृथा-पुत्र अर्जुन" },
      { word: "न एतत्", meaning: "यह नहीं" },
      { word: "त्वयि", meaning: "तुममें या तुम्हारे लिए" },
      { word: "उपपद्यते", meaning: "उचित ठहरता या शोभा देता है" },
      { word: "क्षुद्रम्", meaning: "तुच्छ या संकुचित" },
      { word: "हृदयदौर्बल्यम्", meaning: "मन की दुर्बलता" },
      { word: "त्यक्त्वा", meaning: "छोड़कर" },
      { word: "उत्तिष्ठ", meaning: "उठ खड़े हो" },
      {
        word: "परंतप",
        meaning: "शत्रुओं का दमन करने वाले अर्जुन के लिए संबोधन",
      },
    ],
    contextHindi:
      "पिछले श्लोक में प्रश्न उठाने के बाद श्रीकृष्ण अब अर्जुन को स्पष्ट रूप से संबोधित करते हैं। वे उसे निराशा में डूबे रहने के बजाय अपनी मानसिक दुर्बलता से बाहर आने और परिस्थिति का सामना करने के लिए कहते हैं।",
    explanationHindi:
      "श्रीकृष्ण अर्जुन से कहते हैं कि वह साहस खो देने वाली अवस्था के आगे न झुके, क्योंकि यह उसके व्यक्तित्व और जिम्मेदारी के अनुरूप नहीं है। ‘हृदयदौर्बल्यम्’ मन के भीतर पैदा हुई ऐसी दुर्बलता की ओर संकेत करता है जो व्यक्ति को निर्णय और कर्म से रोक सकती है। ‘उत्तिष्ठ’ केवल शारीरिक रूप से उठने का आदेश नहीं, बल्कि संभलकर परिस्थिति का सामना करने का आह्वान भी है। इस प्रसंग में साहस का अर्थ भावनाओं से इनकार करना नहीं, बल्कि उन्हें समझते हुए अपने कर्तव्य पर विचार करना है।",
    keyTeachingHindi:
      "साहस का अर्थ यह नहीं कि मन में कभी दुख या संदेह न हो; साहस यह है कि कठिन भावनाओं के बीच भी विवेकपूर्वक आगे बढ़ने का प्रयास किया जाए।",
    lifeApplicationHindi:
      "जब चिंता या निराशा किसी आवश्यक काम को टालने पर मजबूर करे, तो समस्या को छोटे और स्पष्ट कदमों में बाँटें। अपनी जिम्मेदारी पहचानें, उचित सलाह लें और पहला व्यावहारिक कदम उठाएँ।",
  },
];

const newFieldNames = [
  "wordMeanings",
  "contextHindi",
  "explanationHindi",
  "keyTeachingHindi",
  "lifeApplicationHindi",
];

function hasEducationalContent(verse) {
  return newFieldNames.some((field) => {
    const value = verse[field];
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === "string" && value.trim().length > 0;
  });
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from backend/.env. No changes made.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    console.log("Connected database:", mongoose.connection.name);
    console.log("Database host:", mongoose.connection.host);

    const [totalVerses, chapterTwoCount, targets] = await Promise.all([
      Verse.countDocuments(),
      Verse.countDocuments({ chapterNumber: TARGET_CHAPTER }),
      Verse.find({
        chapterNumber: TARGET_CHAPTER,
        verseNumber: {
          $in: educationalContent.map((item) => item.verseNumber),
        },
      })
        .select(
          "chapterNumber verseNumber sanskrit hindiMeaning wordMeanings contextHindi explanationHindi keyTeachingHindi lifeApplicationHindi",
        )
        .lean(),
    ]);

    if (totalVerses !== EXPECTED_TOTAL_VERSES) {
      throw new Error(`Expected 700 verses; found ${totalVerses}. Aborting.`);
    }

    if (chapterTwoCount !== EXPECTED_CHAPTER_TWO_VERSES) {
      throw new Error(
        `Expected 72 Chapter 2 verses; found ${chapterTwoCount}. Aborting.`,
      );
    }

    if (targets.length !== educationalContent.length) {
      throw new Error(
        `Expected all three target verses; found ${targets.length}. Aborting.`,
      );
    }

    for (const target of targets) {
      if (!target.sanskrit?.trim() || !target.hindiMeaning?.trim()) {
        throw new Error(
          `Verse 2.${target.verseNumber} is missing its existing Sanskrit or Hindi meaning. Aborting.`,
        );
      }
      if (hasEducationalContent(target)) {
        throw new Error(
          `Verse 2.${target.verseNumber} already has educational content. No records were updated; inspect it before proceeding.`,
        );
      }
    }

    const applyChanges = process.argv.includes("--apply");

    if (!applyChanges) {
      console.log("\nDRY RUN ONLY: no database records were changed.");
      console.log("The following records passed the safety checks:");
      console.log(
        targets
          .sort((a, b) => a.verseNumber - b.verseNumber)
          .map((item) => ({
            chapterNumber: item.chapterNumber,
            verseNumber: item.verseNumber,
            sanskritPreview: item.sanskrit.slice(0, 70),
            hasExistingHindiMeaning: Boolean(item.hindiMeaning?.trim()),
            plannedNewFields: newFieldNames,
          })),
      );
      console.log(
        "\nAfter verifying the database host/name and target verses, run this same script with --apply to write only these three records.",
      );
      return;
    }

    const operations = educationalContent.map((content) => {
      const target = targets.find(
        (item) => item.verseNumber === content.verseNumber,
      );
      return {
        updateOne: {
          filter: {
            _id: target._id,
            chapterNumber: TARGET_CHAPTER,
            verseNumber: content.verseNumber,
          },
          update: {
            $set: {
              wordMeanings: content.wordMeanings,
              contextHindi: content.contextHindi,
              explanationHindi: content.explanationHindi,
              keyTeachingHindi: content.keyTeachingHindi,
              lifeApplicationHindi: content.lifeApplicationHindi,
            },
          },
        },
      };
    });

    const result = await Verse.bulkWrite(operations, { ordered: true });
    if (result.modifiedCount !== educationalContent.length) {
      throw new Error(
        `Expected ${educationalContent.length} updated records; got ${result.modifiedCount}. Verify database state.`,
      );
    }

    const verify = await Verse.find({
      chapterNumber: TARGET_CHAPTER,
      verseNumber: { $in: educationalContent.map((item) => item.verseNumber) },
    })
      .select(
        "chapterNumber verseNumber wordMeanings contextHindi explanationHindi keyTeachingHindi lifeApplicationHindi",
      )
      .sort({ verseNumber: 1 })
      .lean();

    const allVerified =
      verify.length === 3 &&
      verify.every(
        (item) =>
          Array.isArray(item.wordMeanings) &&
          item.wordMeanings.length > 0 &&
          item.contextHindi?.trim() &&
          item.explanationHindi?.trim() &&
          item.keyTeachingHindi?.trim() &&
          item.lifeApplicationHindi?.trim(),
      );

    if (!allVerified) {
      throw new Error(
        "Post-update verification failed. Inspect the three target records.",
      );
    }

    console.log(
      "\nSUCCESS: educational content added to only Chapter 2, verses 1–3.",
    );
    console.log({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      verseRecordsAdded: 0,
      verseRecordsDeleted: 0,
      existingSanskritAndHindiMeaningsChanged: false,
      updatedVerses: verify.map((item) => ({
        chapterNumber: item.chapterNumber,
        verseNumber: item.verseNumber,
        wordMeanings: item.wordMeanings.length,
        hasContext: Boolean(item.contextHindi?.trim()),
        hasExplanation: Boolean(item.explanationHindi?.trim()),
        hasKeyTeaching: Boolean(item.keyTeachingHindi?.trim()),
        hasLifeApplication: Boolean(item.lifeApplicationHindi?.trim()),
      })),
    });
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("\nEducational content update failed:", error.message);
  process.exitCode = 1;
  if (mongoose.connection.readyState !== 0) {
    mongoose.disconnect().catch(() => {});
  }
});
