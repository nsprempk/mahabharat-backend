import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Read-only Bhagavad Gita content audit.
 *
 * Checks the public API data consumed by the React site. It never writes to
 * MongoDB. It writes JSON and CSV reports beneath ./reports by default.
 *
 * Run from backend:
 *   node utils/auditGitaContent.js
 *
 * To audit a local backend instead:
 *   $env:GITA_API_BASE = "http://localhost:5000/api"
 *   node utils/auditGitaContent.js
 */

const DEFAULT_API_BASE = "https://api.bhagavadgita.site/api";
const API_BASE = (process.env.GITA_API_BASE || DEFAULT_API_BASE).replace(
  /\/+$/,
  "",
);
const EXPECTED_CHAPTERS = 18;
const EXPECTED_TOTAL_VERSES = 700;

// Counts currently used by the site's sitemap generator.
// Chapter 13 differs across source editions/datasets; this audit reports the
// difference rather than deleting or changing any verse.
const EXPECTED_VERSE_COUNTS = {
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const reportDir = path.join(backendRoot, ".audit-reports");

const issues = [];
const chapterSummaries = [];
const allVerses = [];
const apiFailures = [];

function addIssue(
  severity,
  code,
  chapterNumber,
  verseNumber,
  detail,
  excerpt = "",
) {
  issues.push({
    severity,
    code,
    chapterNumber: chapterNumber ?? "",
    verseNumber: verseNumber ?? "",
    detail: String(detail || ""),
    excerpt: String(excerpt || "").slice(0, 160),
  });
}

function normalizeString(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function firstString(record, keys) {
  for (const key of keys) {
    const value = normalizeString(record?.[key]);
    if (value) return value;
  }
  return "";
}

function firstArray(payload, keys) {
  for (const key of keys) {
    const value = payload?.[key];
    if (Array.isArray(value)) return value;
  }
  return null;
}

function getChapterList(payload) {
  return (
    firstArray(payload, ["chapters"]) ||
    firstArray(payload?.data, ["chapters"]) ||
    (Array.isArray(payload?.data) ? payload.data : null) ||
    (Array.isArray(payload) ? payload : null)
  );
}

function getVerseList(payload) {
  return (
    firstArray(payload, ["verses"]) ||
    firstArray(payload, ["shlokas"]) ||
    firstArray(payload?.data, ["verses", "shlokas"]) ||
    (Array.isArray(payload?.data) ? payload.data : null) ||
    (Array.isArray(payload) ? payload : null)
  );
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(25000),
  });

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} for ${url}: ${text.slice(0, 180)}`,
    );
  }
  if (!contentType.toLowerCase().includes("json")) {
    throw new Error(
      `Expected JSON from ${url}; received content-type "${contentType}" and body "${text.slice(0, 120)}"`,
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON returned by ${url}`);
  }
}

function getVerseNumber(verse) {
  const raw = verse?.verseNumber ?? verse?.number ?? verse?.shlokaNumber;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function getVerseChapter(verse, requestedChapter) {
  const raw = verse?.chapterNumber ?? verse?.chapter ?? verse?.chapterNo;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : requestedChapter;
}

function getSanskrit(verse) {
  return firstString(verse, ["sanskrit", "sanskritText", "text", "slok"]);
}

function getTransliteration(verse) {
  return firstString(verse, [
    "transliteration",
    "transliterationText",
    "romanized",
  ]);
}

function getHindiMeaning(verse) {
  return firstString(verse, [
    "hindiMeaning",
    "meaningHindi",
    "translationHindi",
    "hindiTranslation",
    "meaning",
  ]);
}

function normalizeForDuplicate(text) {
  return String(text || "")
    .normalize("NFKC")
    .toLocaleLowerCase("hi-IN")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[।॥|,;:!?\-–—()[\]{}“”"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PLACEHOLDER_PATTERNS = [
  /शीघ्र\s*जोड़ा\s*जाएगा/i,
  /जल्द\s*जोड़ा\s*जाएगा/i,
  /अर्थ\s*उपलब्ध\s*नहीं/i,
  /हिंदी\s*अर्थ\s*उपलब्ध\s*नहीं/i,
  /इस\s*श्लोक\s*का\s*(सरल\s*)?हिंदी\s*अर्थ/i,
  /coming\s+soon/i,
  /translation\s+coming/i,
  /placeholder/i,
  /todo/i,
  /lorem\s+ipsum/i,
  /not\s+available/i,
];

function isPlaceholder(text) {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text || ""));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function printTable(rows) {
  const widths = [
    Math.max(7, ...rows.map((r) => String(r.chapter).length)),
    Math.max(8, ...rows.map((r) => String(r.expected).length)),
    Math.max(8, ...rows.map((r) => String(r.actual).length)),
    Math.max(7, ...rows.map((r) => String(r.delta).length)),
    Math.max(12, ...rows.map((r) => String(r.status).length)),
  ];

  const line = `+${widths.map((w) => "-".repeat(w + 2)).join("+")}+`;
  const format = (cells) =>
    `| ${cells.map((v, i) => String(v).padEnd(widths[i])).join(" | ")} |`;

  console.log(line);
  console.log(format(["Chapter", "Expected", "Actual", "Delta", "Status"]));
  console.log(line);
  for (const row of rows) {
    console.log(
      format([row.chapter, row.expected, row.actual, row.delta, row.status]),
    );
  }
  console.log(line);
}

async function main() {
  console.log("\n=====================================================");
  console.log("  BHAGAVAD GITA CONTENT AUDIT (READ-ONLY)");
  console.log("=====================================================");
  console.log(`API: ${API_BASE}`);
  console.log("No database writes will be performed.\n");

  let chapterPayload;
  try {
    chapterPayload = await getJson(`${API_BASE}/chapters`);
  } catch (error) {
    console.error(`Could not load chapters: ${error.message}`);
    console.error(
      "\nCheck the API URL or set GITA_API_BASE to your local API.",
    );
    process.exitCode = 1;
    return;
  }

  const apiChapters = getChapterList(chapterPayload);
  if (!apiChapters) {
    console.error(
      "The chapters API returned JSON, but no chapter array was found.",
    );
    console.error(
      "Inspect the /api/chapters response shape and adjust getChapterList().",
    );
    console.error(JSON.stringify(chapterPayload).slice(0, 1200));
    process.exitCode = 1;
    return;
  }

  if (apiChapters.length !== EXPECTED_CHAPTERS) {
    addIssue(
      "ERROR",
      "CHAPTER_COUNT_MISMATCH",
      "",
      "",
      `Expected ${EXPECTED_CHAPTERS} chapters, API returned ${apiChapters.length}.`,
    );
  }

  const chapterMetaByNumber = new Map();
  for (const chapter of apiChapters) {
    const number = Number(
      chapter?.number ?? chapter?.chapterNumber ?? chapter?.chapter,
    );
    const title = firstString(chapter, [
      "title",
      "nameHindi",
      "name",
      "titleHindi",
    ]);
    const description = firstString(chapter, [
      "description",
      "descriptionHindi",
      "summaryHindi",
    ]);
    const verseCount = Number(
      chapter?.verseCount ?? chapter?.totalShlokas ?? chapter?.totalVerses,
    );

    if (!Number.isInteger(number) || number < 1 || number > 18) {
      addIssue(
        "ERROR",
        "INVALID_CHAPTER_NUMBER",
        "",
        "",
        `Chapter record has invalid number: ${chapter?.number ?? chapter?.chapterNumber ?? "(missing)"}`,
      );
      continue;
    }

    if (chapterMetaByNumber.has(number)) {
      addIssue(
        "ERROR",
        "DUPLICATE_CHAPTER_RECORD",
        number,
        "",
        "More than one chapter record has this chapter number.",
      );
    }
    chapterMetaByNumber.set(number, chapter);

    if (!title)
      addIssue(
        "ERROR",
        "MISSING_CHAPTER_TITLE",
        number,
        "",
        "Chapter title is empty.",
      );
    if (!description)
      addIssue(
        "WARNING",
        "MISSING_CHAPTER_DESCRIPTION",
        number,
        "",
        "Chapter description is empty; add an original chapter introduction/summary.",
      );
    if (!Number.isFinite(verseCount) || verseCount <= 0) {
      addIssue(
        "WARNING",
        "MISSING_CHAPTER_VERSE_COUNT",
        number,
        "",
        "Chapter metadata has no valid verseCount/totalShlokas.",
      );
    }
  }

  for (
    let chapterNumber = 1;
    chapterNumber <= EXPECTED_CHAPTERS;
    chapterNumber++
  ) {
    if (!chapterMetaByNumber.has(chapterNumber)) {
      addIssue(
        "ERROR",
        "MISSING_CHAPTER_RECORD",
        chapterNumber,
        "",
        "Expected chapter record is missing from the chapter list.",
      );
    }
  }

  console.log(`Chapter records received: ${apiChapters.length}`);
  console.log("Fetching verse lists chapter by chapter...");

  for (
    let chapterNumber = 1;
    chapterNumber <= EXPECTED_CHAPTERS;
    chapterNumber++
  ) {
    const url = `${API_BASE}/verses/chapter/${chapterNumber}`;

    try {
      const payload = await getJson(url);
      if (payload?.success === false) {
        throw new Error(payload.message || "API returned success:false");
      }

      const verses = getVerseList(payload);
      if (!verses) {
        throw new Error(
          `Response did not contain a recognizable verse array. Body: ${JSON.stringify(payload).slice(0, 250)}`,
        );
      }

      const expected = EXPECTED_VERSE_COUNTS[chapterNumber];
      const actual = verses.length;
      const delta = actual - expected;
      const status =
        delta === 0
          ? "OK"
          : delta > 0
            ? "EXTRA / VERIFY EDITION"
            : "MISSING VERSES";

      chapterSummaries.push({
        chapter: chapterNumber,
        expected,
        actual,
        delta,
        status,
      });

      if (delta !== 0) {
        addIssue(
          "WARNING",
          "VERSE_COUNT_MISMATCH",
          chapterNumber,
          "",
          `Sitemap count expects ${expected}, but API returned ${actual} (delta ${delta}). Verify source edition/count convention before changing data or sitemap.`,
        );
      }

      const seenNumbers = new Map();
      const expectedNums = new Set(
        Array.from({ length: expected }, (_, i) => i + 1),
      );

      for (const verse of verses) {
        const number = getVerseNumber(verse);
        const verseChapter = getVerseChapter(verse, chapterNumber);
        const sanskrit = getSanskrit(verse);
        const transliteration = getTransliteration(verse);
        const hindiMeaning = getHindiMeaning(verse);
        const titleKey = `${verseChapter}.${number ?? "UNKNOWN"}`;
        const record = {
          chapterNumber: verseChapter,
          requestedChapterNumber: chapterNumber,
          verseNumber: number,
          id: normalizeString(verse?._id ?? verse?.id),
          sanskrit,
          transliteration,
          hindiMeaning,
          tags: Array.isArray(verse?.tags) ? verse.tags : [],
        };
        allVerses.push(record);

        if (!number) {
          addIssue(
            "ERROR",
            "MISSING_OR_INVALID_VERSE_NUMBER",
            chapterNumber,
            "",
            "Verse record has no positive integer verseNumber/number.",
            sanskrit,
          );
        } else {
          seenNumbers.set(number, (seenNumbers.get(number) || 0) + 1);
          expectedNums.delete(number);

          if (number > expected) {
            addIssue(
              "WARNING",
              "VERSE_OUTSIDE_SITEMAP_RANGE",
              chapterNumber,
              number,
              `Verse number exceeds the sitemap's expected range (1–${expected}). This may reflect a source-edition difference; verify the text before altering it.`,
              sanskrit,
            );
          }
        }

        if (verseChapter !== chapterNumber) {
          addIssue(
            "ERROR",
            "CHAPTER_NUMBER_MISMATCH",
            chapterNumber,
            number,
            `Requested chapter ${chapterNumber}, but record declares chapter ${verseChapter}.`,
            sanskrit,
          );
        }

        if (!sanskrit) {
          addIssue(
            "ERROR",
            "MISSING_SANSKRIT",
            chapterNumber,
            number,
            "Sanskrit text is empty.",
          );
        } else if (sanskrit.length < 8) {
          addIssue(
            "WARNING",
            "VERY_SHORT_SANSKRIT",
            chapterNumber,
            number,
            `Sanskrit text is unusually short (${sanskrit.length} characters); review the source record.`,
            sanskrit,
          );
        }

        if (!transliteration) {
          addIssue(
            "WARNING",
            "MISSING_TRANSLITERATION",
            chapterNumber,
            number,
            "Transliteration is empty. It is optional, but the current reader UI supports it.",
          );
        }

        if (!hindiMeaning) {
          addIssue(
            "ERROR",
            "MISSING_HINDI_MEANING",
            chapterNumber,
            number,
            "Hindi meaning is empty.",
          );
        } else {
          if (isPlaceholder(hindiMeaning)) {
            addIssue(
              "ERROR",
              "PLACEHOLDER_HINDI_MEANING",
              chapterNumber,
              number,
              "Hindi meaning appears to be placeholder/template text.",
              hindiMeaning,
            );
          }
          if (hindiMeaning.length < 25) {
            addIssue(
              "WARNING",
              "SHORT_HINDI_MEANING",
              chapterNumber,
              number,
              `Hindi meaning is only ${hindiMeaning.length} characters; verify that it explains this specific verse rather than being a fragment.`,
              hindiMeaning,
            );
          }
          if (/[A-Za-z]{3,}/.test(hindiMeaning)) {
            addIssue(
              "WARNING",
              "LATIN_TEXT_IN_HINDI_MEANING",
              chapterNumber,
              number,
              "Hindi meaning contains Latin-script text. Review because the site requirement is Hindi-only meanings.",
              hindiMeaning,
            );
          }
        }
      }

      for (const [number, count] of seenNumbers.entries()) {
        if (count > 1) {
          addIssue(
            "ERROR",
            "DUPLICATE_VERSE_NUMBER",
            chapterNumber,
            number,
            `The verse list contains ${count} records numbered ${number}.`,
          );
        }
      }

      for (const missing of [...expectedNums].sort((a, b) => a - b)) {
        addIssue(
          "WARNING",
          "EXPECTED_VERSE_NUMBER_MISSING",
          chapterNumber,
          missing,
          `Expected verse number ${missing} is not present within the sitemap's configured range. Verify source edition/count convention.`,
        );
      }

      console.log(
        `Chapter ${String(chapterNumber).padStart(2, "0")}: ${actual} verses fetched (expected ${expected})`,
      );
    } catch (error) {
      apiFailures.push({ chapterNumber, url, message: error.message });
      addIssue(
        "ERROR",
        "CHAPTER_VERSE_API_FAILURE",
        chapterNumber,
        "",
        error.message,
      );
      chapterSummaries.push({
        chapter: chapterNumber,
        expected: EXPECTED_VERSE_COUNTS[chapterNumber],
        actual: "FAILED",
        delta: "",
        status: "API FAILED",
      });
      console.error(
        `Chapter ${chapterNumber}: FETCH FAILED — ${error.message}`,
      );
    }
  }

  // Cross-record duplicates are review flags, not automatic proof of bad content.
  const duplicateGroups = [
    {
      field: "hindiMeaning",
      code: "REPEATED_HINDI_MEANING",
      minCount: 3,
      label: "same normalized Hindi meaning appears on multiple verses",
    },
    {
      field: "sanskrit",
      code: "REPEATED_SANSKRIT_TEXT",
      minCount: 2,
      label: "same normalized Sanskrit text appears on multiple verses",
    },
  ];

  for (const { field, code, minCount, label } of duplicateGroups) {
    const groups = new Map();
    for (const verse of allVerses) {
      const normalized = normalizeForDuplicate(verse[field]);
      if (!normalized || normalized.length < 12) continue;
      const group = groups.get(normalized) || [];
      group.push(verse);
      groups.set(normalized, group);
    }

    for (const [normalized, group] of groups.entries()) {
      if (group.length >= minCount) {
        const refs = group
          .map((v) => `${v.chapterNumber}.${v.verseNumber ?? "?"}`)
          .join(", ");
        for (const verse of group) {
          addIssue(
            "WARNING",
            code,
            verse.chapterNumber,
            verse.verseNumber,
            `A ${label}; matching group size ${group.length}. Group refs: ${refs}. Review manually because some repetition can be legitimate.`,
            verse[field],
          );
        }
      }
    }
  }

  const totalVerses = allVerses.length;
  if (totalVerses !== EXPECTED_TOTAL_VERSES) {
    addIssue(
      "WARNING",
      "TOTAL_VERSE_COUNT_MISMATCH",
      "",
      "",
      `Sitemap expects ${EXPECTED_TOTAL_VERSES} verses, but the API returned ${totalVerses}. This may be a source-edition difference; reconcile the data and sitemap deliberately.`,
    );
  }

  const uniquePairs = new Set(
    allVerses
      .filter((v) => v.verseNumber != null)
      .map((v) => `${v.chapterNumber}.${v.verseNumber}`),
  );

  const issueCounts = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    acc[issue.code] = (acc[issue.code] || 0) + 1;
    return acc;
  }, {});

  const placeholderCount = issues.filter(
    (i) => i.code === "PLACEHOLDER_HINDI_MEANING",
  ).length;
  const missingHindiCount = issues.filter(
    (i) => i.code === "MISSING_HINDI_MEANING",
  ).length;
  const missingSanskritCount = issues.filter(
    (i) => i.code === "MISSING_SANSKRIT",
  ).length;
  const latinHindiCount = issues.filter(
    (i) => i.code === "LATIN_TEXT_IN_HINDI_MEANING",
  ).length;
  const duplicateMeaningRecords = issues.filter(
    (i) => i.code === "REPEATED_HINDI_MEANING",
  ).length;
  const chapterCountMismatches = issues.filter(
    (i) => i.code === "VERSE_COUNT_MISMATCH",
  ).length;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await fs.mkdir(reportDir, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    apiBase: API_BASE,
    readOnly: true,
    expected: {
      chapterCount: EXPECTED_CHAPTERS,
      totalVerseCount: EXPECTED_TOTAL_VERSES,
      verseCountsByChapter: EXPECTED_VERSE_COUNTS,
    },
    actual: {
      chapterRecords: apiChapters.length,
      verseRecordsFetched: totalVerses,
      uniqueChapterVersePairs: uniquePairs.size,
      apiFailures: apiFailures.length,
    },
    keyFindings: {
      placeholderHindiMeanings: placeholderCount,
      missingHindiMeanings: missingHindiCount,
      missingSanskritTexts: missingSanskritCount,
      HindiMeaningsContainingLatinText: latinHindiCount,
      repeatedHindiMeaningRecordsFlaggedForReview: duplicateMeaningRecords,
      chapterVerseCountMismatches: chapterCountMismatches,
    },
    issueCounts,
    chapters: chapterSummaries,
    apiFailures,
    issues,
  };

  const jsonPath = path.join(reportDir, `gita-content-audit-${timestamp}.json`);
  const csvPath = path.join(reportDir, `gita-content-audit-${timestamp}.csv`);

  await fs.writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  const csvHeader = [
    "severity",
    "code",
    "chapterNumber",
    "verseNumber",
    "detail",
    "excerpt",
  ];
  const csvRows = [
    csvHeader,
    ...issues.map((i) => [
      i.severity,
      i.code,
      i.chapterNumber,
      i.verseNumber,
      i.detail,
      i.excerpt,
    ]),
  ];
  const csvContent =
    csvRows.map((row) => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
  await fs.writeFile(csvPath, csvContent, "utf8");

  console.log("\n=====================================================");
  console.log("                 AUDIT SUMMARY");
  console.log("=====================================================");
  console.log(`Chapter records:                  ${apiChapters.length}`);
  console.log(`Verse records fetched:            ${totalVerses}`);
  console.log(`Unique chapter.verse pairs:       ${uniquePairs.size}`);
  console.log(`API chapter failures:             ${apiFailures.length}`);
  console.log(`Placeholder Hindi meanings:       ${placeholderCount}`);
  console.log(`Missing Hindi meanings:           ${missingHindiCount}`);
  console.log(`Missing Sanskrit texts:           ${missingSanskritCount}`);
  console.log(`Hindi meanings with Latin text:   ${latinHindiCount}`);
  console.log(`Repeated Hindi meaning flags:     ${duplicateMeaningRecords}`);
  console.log(`Chapter count mismatches:         ${chapterCountMismatches}`);
  console.log(`Total audit flags:                ${issues.length}`);
  console.log("");
  printTable(chapterSummaries);

  const priorityIssues = issues
    .filter((i) => i.severity === "ERROR")
    .slice(0, 30);
  if (priorityIssues.length) {
    console.log("\nTop ERROR findings (first 30):");
    for (const issue of priorityIssues) {
      console.log(
        `- [${issue.code}] ${issue.chapterNumber || "-"}${issue.verseNumber ? `.${issue.verseNumber}` : ""}: ${issue.detail}${issue.excerpt ? ` | ${issue.excerpt}` : ""}`,
      );
    }
  }

  console.log("\nReports saved:");
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV : ${csvPath}`);
  console.log(
    "\nImportant: repeated meanings and verse-count differences are review flags, not automatic proof of incorrect content. Verify source-edition differences before changing data or sitemap.",
  );
}

main().catch((error) => {
  console.error("\nContent audit failed:", error);
  process.exitCode = 1;
});
