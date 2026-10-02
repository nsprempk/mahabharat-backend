import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import chapterRoutes from "./routes/chapterRoutes.js";
import verseRoutes from "./routes/verseRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import connectDB from "./config/db.js";

dotenv.config();

/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
*/

const app = express();

/*
|--------------------------------------------------------------------------
| Paths
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.resolve(__dirname, "../frontend/dist");

const frontendIndex = path.join(frontendDist, "index.html");

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
|
| Local:
|   http://localhost:5173
|
| Production:
|   https://bhagavadgita.site
|
| CLIENT_URL can also be supplied through .env.
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://bhagavadgita.site",
  "https://www.bhagavadgita.site",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Allow requests without an Origin header.
       * This includes direct server-to-server requests
       * and some development tools.
       */
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

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

app.use(morgan("dev"));

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
| Health
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
| Production React files
|--------------------------------------------------------------------------
*/

const frontendExists = fs.existsSync(frontendIndex);

if (frontendExists) {
  console.log(`Frontend build found: ${frontendDist}`);

  /*
   * Serve Vite production files
   */
  app.use(express.static(frontendDist));
} else {
  console.warn(`Frontend build not found: ${frontendIndex}`);
}

/*
|--------------------------------------------------------------------------
| Root route
|--------------------------------------------------------------------------
|
| Production:
|   /
|   -> React application
|
| Local backend-only mode:
|   -> API status JSON
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  if (frontendExists) {
    return res.sendFile(frontendIndex);
  }

  return res.status(200).json({
    success: true,
    message: "Mahabharat API is running",
  });
});

/*
|--------------------------------------------------------------------------
| React Router SPA fallback
|--------------------------------------------------------------------------
|
| This is what fixes direct visits such as:
|
| /gita
| /gita/adhyay/1
| /gita/adhyay/1/shlok/1
| /search
| /favorites
| /about
| /privacy-policy
|
| Express sends index.html and React Router
| takes over in the browser.
|--------------------------------------------------------------------------
*/

if (frontendExists) {
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    return res.sendFile(frontendIndex);
  });
}

/*
|--------------------------------------------------------------------------
| API 404
|--------------------------------------------------------------------------
|
| API requests that do not exist should return
| JSON instead of React's index.html.
|--------------------------------------------------------------------------
*/

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| Global 404
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
| Global error handler
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================");

  console.log("      MAHABHARAT SERVER");

  console.log("==========================================");

  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

  console.log(`Port: ${PORT}`);

  console.log(`Frontend: ${frontendExists ? "READY" : "NOT BUILT"}`);

  console.log("API: /api");

  console.log("==========================================");
});
