import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import chapterRoutes from "./routes/chapterRoutes.js";
import verseRoutes from "./routes/verseRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import connectDB from "./config/db.js";

dotenv.config();

const app = express();

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/chapters", chapterRoutes);
app.use("/api/verses", verseRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mahabharat API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mahabharat backend healthy",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
