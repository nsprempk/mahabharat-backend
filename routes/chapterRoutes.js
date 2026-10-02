import express from "express";

import { getChapters, getChapter } from "../controllers/chapterController.js";

const router = express.Router();

router.get("/", getChapters);
router.get("/:number", getChapter);

export default router;
