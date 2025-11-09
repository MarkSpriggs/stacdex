import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// ✅ Import route modules
import authRouter from "./api/auth.js";
import itemsRouter from "./api/items.js";
import usersRouter from "./api/users.js";
import lookupsRouter from "./api/lookups.js";
import bulkUploadRouter from "./api/bulkUpload.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ Enable CORS for frontend requests
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ✅ Register API routes
app.use("/auth", authRouter);      // /auth/register, /auth/login
app.use("/items", itemsRouter);    // /items/...
app.use("/users", usersRouter);    // /users/...
app.use("/lookups", lookupsRouter); // /lookups/categories, /lookups/statuses, etc.
app.use("/bulk-upload", bulkUploadRouter); // /bulk-upload, /bulk-upload/template


// ✅ Health check route
app.get("/", (req, res) => res.send("StacDex backend is running ✅"));

// (Optional) remove if you don’t want any global error handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

export default app;
