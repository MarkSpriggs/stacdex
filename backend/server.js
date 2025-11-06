import app from "./app.js";
import db from "./db/client.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("Connecting to database...");
    console.log("Database URL:", process.env.DATABASE_URL); // just for debug, remove in prod

    await db.connect();
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server!");
    console.error("Error message:", err.message);
    console.error(err.stack);
    process.exit(1); // stops Render from hanging
  }
}

startServer();
