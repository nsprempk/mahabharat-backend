import express from "express";

import { searchVerses } from "../controllers/verseController.js";

const router = express.Router();

router.get("/", searchVerses);

export default router;
