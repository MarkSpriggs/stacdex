import db from "../client.js";

// =============================================================
// GET ALL CATEGORIES
// =============================================================
export async function getAllCategories() {
  const sql = `
    SELECT id, name
    FROM categories
    ORDER BY name ASC;
  `;
  const { rows } = await db.query(sql);
  return rows;
}

// =============================================================
// GET ALL STATUSES
// =============================================================
export async function getAllStatuses() {
  const sql = `
    SELECT id, name
    FROM status
    ORDER BY id ASC;
  `;
  const { rows } = await db.query(sql);
  return rows;
}

// =============================================================
// GET ALL GRADING COMPANIES
// =============================================================
export async function getAllGradingCompanies() {
  const sql = `
    SELECT id, name
    FROM grading_companies
    ORDER BY name ASC;
  `;
  const { rows } = await db.query(sql);
  return rows;
}

// =============================================================
// GET ALL CONDITIONS
// =============================================================
export async function getAllConditions() {
  const sql = `
    SELECT id, name
    FROM conditions
    ORDER BY id ASC;
  `;
  const { rows } = await db.query(sql);
  return rows;
}

// =============================================================
// GET ALL TEAMS (optionally filtered by category)
// =============================================================
export async function getAllTeams(categoryId = null) {
  let sql = `
    SELECT t.id, t.name, t.category_id, c.name as category_name
    FROM teams t
    LEFT JOIN categories c ON t.category_id = c.id
  `;

  const params = [];
  if (categoryId) {
    sql += ` WHERE t.category_id = $1`;
    params.push(categoryId);
  }

  sql += ` ORDER BY t.name ASC;`;

  const { rows } = await db.query(sql, params);
  return rows;
}
