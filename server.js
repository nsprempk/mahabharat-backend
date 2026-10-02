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

/*
|--------------------------------------------------------------------------
| Trust proxy
|--------------------------------------------------------------------------
|
| Useful when running behind Hostinger's reverse proxy.
|--------------------------------------------------------------------------
*/

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://bhagavadgita.site",
  "https://www.bhagavadgita.site",
];

if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.trim().replace(/\/$/, "");

  if (clientUrl && !allowedOrigins.includes(clientUrl)) {
    allowedOrigins.push(clientUrl);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Allow requests without an Origin header.
       * This is useful for direct browser/API requests,
       * health checks and server-to-server requests.
       */
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error(`CORS blocked: ${origin}`);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/*
|--------------------------------------------------------------------------
| Body parsing
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

app.use(morgan("combined"));

/*
|--------------------------------------------------------------------------
| Root API route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Mahabharat API is running",
  });
});

/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Mahabharat backend healthy",
  });
});

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/chapters", chapterRoutes);

app.use("/api/verses", verseRoutes);

app.use("/api/search", searchRoutes);

/*
|--------------------------------------------------------------------------
| API 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use("/api", (req, res) => {
  console.warn(`API route not found: ${req.method} ${req.originalUrl}`);

  return res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| Non-API 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("==========================================");

  console.error("GLOBAL EXPRESS ERROR");

  console.error(error);

  console.error("==========================================");

  if (res.headersSent) {
    return next(error);
  }

  /*
   * CORS error
   */
  if (error.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Origin is not allowed.",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message || "Internal server error",
  });
});

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================");

  console.log("        MAHABHARAT API SERVER");

  console.log("==========================================");

  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

  console.log(`Port: ${PORT}`);

  console.log(`Client URL: ${process.env.CLIENT_URL || "not configured"}`);

  console.log("API Base: /api");

  console.log("==========================================");

  console.log("Available endpoints:");

  console.log(`GET  /api/health`);

  console.log(`GET  /api/chapters`);

  console.log(`GET  /api/verses/chapter/:chapterNumber`);

  console.log(`GET  /api/verses/chapter/:chapterNumber/verse/:verseNumber`);

  console.log(`GET  /api/search?q=...`);

  console.log("==========================================");
});
