import express from "express";

import {
  getChapterVerses,
  getVerse,
  searchVerses,
} from "../controllers/verseController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Chapter verses
|--------------------------------------------------------------------------
*/

router.get("/chapter/:chapterNumber", getChapterVerses);

/*
|--------------------------------------------------------------------------
| Single verse
|--------------------------------------------------------------------------
*/

router.get("/chapter/:chapterNumber/verse/:verseNumber", getVerse);

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

router.get("/search", searchVerses);

export default router;
