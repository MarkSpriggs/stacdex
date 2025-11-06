import db from "../client.js";

// =============================================================
// CREATE USER (Register)
// =============================================================
export async function createUser({ name, email, hashedPassword, profile_image_url }) {
  const sql = `
    INSERT INTO users (name, email, password, profile_image_url)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, profile_image_url;
  `;

  const values = [name, email, hashedPassword, profile_image_url || null];
  const { rows: [user] } = await db.query(sql, values);
  return user;
}

// =============================================================
// GET ALL USERS
// =============================================================
export async function getAllUsers() {
  const sql = `
    SELECT id, name, email, profile_image_url
    FROM users
    ORDER BY id ASC;
  `;

  const { rows } = await db.query(sql);
  return rows;
}

// =============================================================
// GET USER BY ID
// =============================================================
export async function getUserById(id) {
  const sql = `
    SELECT id, name, email, profile_image_url
    FROM users
    WHERE id = $1;
  `;

  const { rows: [user] } = await db.query(sql, [id]);
  return user;
}

// =============================================================
// GET USER BY EMAIL (for login)
// =============================================================
export async function getUserByEmail(email) {
  const sql = `
    SELECT id, name, email, password, profile_image_url
    FROM users
    WHERE email = $1;
  `;

  const { rows: [user] } = await db.query(sql, [email]);
  return user;
}

// =============================================================
// UPDATE USER (for name or profile image updates)
// =============================================================
export async function updateUser(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
  const sql = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING id, name, email, profile_image_url;
  `;

  const { rows: [user] } = await db.query(sql, [...values, id]);
  return user;
}

// =============================================================
// DELETE USER (optional — for future admin controls)
// =============================================================
export async function deleteUser(id) {
  const sql = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, name, email, profile_image_url;
  `;

  const { rows: [user] } = await db.query(sql, [id]);
  return user;
}
