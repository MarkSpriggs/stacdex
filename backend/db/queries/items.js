import db from "../client.js";

// =============================================================
// CREATE ITEM
// =============================================================
export async function createItem({
  user_id,
  title,
  category_id,
  status_id,
  grading_company_id,
  condition_id,
  date_listed,
  date_sold,
  ebay_url,
  tags,
  image_url,
  price_listed,
  market_value,
  player_name,
  team_name,
  year,
  rookie,
  brand,
  sub_brand,
  patch_count,
  numbered_to,
  autograph,
  grade_value
}) {
  const sql = `
    INSERT INTO items (
      user_id, title, category_id, status_id, grading_company_id, condition_id,
      date_listed, date_sold, ebay_url, tags, image_url,
      price_listed, market_value,
      player_name, team_name, year, rookie,
      brand, sub_brand, patch_count, numbered_to, autograph, grade_value
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,
      $12,$13,
      $14,$15,$16,$17,
      $18,$19,$20,$21,$22,$23
    )
    RETURNING *;
  `;

  const values = [
    user_id, title, category_id, status_id, grading_company_id, condition_id,
    date_listed, date_sold, ebay_url, tags, image_url,
    price_listed, market_value,
    player_name, team_name, year, rookie,
    brand, sub_brand, patch_count, numbered_to, autograph, grade_value
  ];

  const { rows: [item] } = await db.query(sql, values);
  return item;
}

// =============================================================
// GET ALL ITEMS (with joins for dropdown names)
// =============================================================
export async function getAllItems() {
  const sql = `
    SELECT 
      i.*, 
      u.name AS user_name,
      c.name AS category_name,
      s.name AS status_name,
      g.name AS grading_company_name,
      cond.name AS condition_name
    FROM items i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN status s ON i.status_id = s.id
    LEFT JOIN grading_companies g ON i.grading_company_id = g.id
    LEFT JOIN conditions cond ON i.condition_id = cond.id
    ORDER BY i.date_created DESC;
  `;

  const { rows } = await db.query(sql);
  return rows;
}

// =============================================================
// GET ITEM BY ID
// =============================================================
export async function getItemById(id) {
  const sql = `
    SELECT 
      i.*, 
      u.name AS user_name,
      c.name AS category_name,
      s.name AS status_name,
      g.name AS grading_company_name,
      cond.name AS condition_name
    FROM items i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN status s ON i.status_id = s.id
    LEFT JOIN grading_companies g ON i.grading_company_id = g.id
    LEFT JOIN conditions cond ON i.condition_id = cond.id
    WHERE i.id = $1;
  `;

  const { rows: [item] } = await db.query(sql, [id]);
  return item;
}

// =============================================================
// GET ITEMS BY USER
// =============================================================
export async function getItemsByUser(user_id) {
  const sql = `
    SELECT 
      i.*, 
      c.name AS category_name,
      s.name AS status_name,
      g.name AS grading_company_name,
      cond.name AS condition_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN status s ON i.status_id = s.id
    LEFT JOIN grading_companies g ON i.grading_company_id = g.id
    LEFT JOIN conditions cond ON i.condition_id = cond.id
    WHERE i.user_id = $1
    ORDER BY i.date_created DESC;
  `;

  const { rows } = await db.query(sql, [user_id]);
  return rows;
}

// =============================================================
// UPDATE ITEM
// =============================================================
export async function updateItem(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
  const sql = `
    UPDATE items
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;

  const { rows: [item] } = await db.query(sql, [...values, id]);
  return item;
}

// =============================================================
// DELETE ITEM
// =============================================================
export async function deleteItem(id) {
  const sql = `
    DELETE FROM items
    WHERE id = $1
    RETURNING *;
  `;
  const { rows: [item] } = await db.query(sql, [id]);
  return item;
}

// =============================================================
// GET STATUS ID BY NAME
// =============================================================
export async function getStatusIdByName(statusName) {
  const sql = `
    SELECT id FROM status WHERE LOWER(name) = LOWER($1);
  `;
  const { rows } = await db.query(sql, [statusName]);
  return rows.length > 0 ? rows[0].id : null;
}
