import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render.com")
       ? { rejectUnauthorized: false } // ✅ Render requires SSL
       : false,                        // ✅ Local doesn’t
});

export default pool;
