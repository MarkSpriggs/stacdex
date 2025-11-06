-- ==============================================================
-- STACDEX DATABASE SCHEMA (with S3 image fields)
-- ==============================================================

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS status;
DROP TABLE IF EXISTS grading_companies;
DROP TABLE IF EXISTS conditions;

-- ==============================================================
-- USERS
-- ==============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_image_url TEXT  -- 🔸 S3 URL for user profile picture
);

-- ==============================================================
-- LOOKUP TABLES
-- ==============================================================

-- Categories (Sports types)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
CREATE UNIQUE INDEX categories_name_lower_key ON categories (LOWER(name));

-- Status (listing states)
CREATE TABLE status (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
CREATE UNIQUE INDEX status_name_lower_key ON status (LOWER(name));

-- Grading companies (PSA, BGS, etc.)
CREATE TABLE grading_companies (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
CREATE UNIQUE INDEX grading_companies_name_lower_key ON grading_companies (LOWER(name));

-- Card condition options (Mint, NM, etc.)
CREATE TABLE conditions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
CREATE UNIQUE INDEX conditions_name_lower_key ON conditions (LOWER(name));

-- ==============================================================
-- ITEMS
-- ==============================================================
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  status_id INT REFERENCES status(id) ON DELETE SET NULL DEFAULT 1,
  grading_company_id INT REFERENCES grading_companies(id) ON DELETE SET NULL,
  condition_id INT REFERENCES conditions(id) ON DELETE SET NULL,

  -- General
  date_created TIMESTAMP DEFAULT NOW(),
  date_listed DATE,
  date_sold DATE,
  ebay_url TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,   -- 🔸 S3 URL for the card image

  -- Pricing
  price_listed NUMERIC(10,2),
  market_value NUMERIC(10,2),

  -- Sports-card fields
  player_name TEXT,
  team_name TEXT,
  year INT,
  rookie BOOLEAN DEFAULT false,
  brand TEXT,
  sub_brand TEXT,
  patch_count INT,
  numbered_to INT,
  autograph BOOLEAN DEFAULT false,

  -- Grading specifics
  grade_value TEXT
);

-- ==============================================================
-- INDEXES
-- ==============================================================

CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_status_id ON items(status_id);
CREATE INDEX idx_items_grading_company_id ON items(grading_company_id);
CREATE INDEX idx_items_condition_id ON items(condition_id);
CREATE INDEX idx_items_player_name ON items(player_name);
CREATE INDEX idx_items_team_name ON items(team_name);
CREATE INDEX idx_items_year ON items(year);
CREATE INDEX idx_items_rookie ON items(rookie);
CREATE INDEX idx_items_autograph ON items(autograph);
CREATE INDEX idx_items_tags_gin ON items USING GIN (tags);

-- ==============================================================
-- SEED DATA
-- ==============================================================

INSERT INTO categories (name) VALUES
('Football'),
('Baseball'),
('Basketball'),
('Hockey')
ON CONFLICT (name) DO NOTHING;

INSERT INTO status (name) VALUES
('Unlisted'),
('Listed'),
('Sold'),
('Shipping'),
('Archived')
ON CONFLICT (name) DO NOTHING;

INSERT INTO grading_companies (name) VALUES
('PSA'),
('BGS'),
('SGC'),
('CGC'),
('CSG'),
('Raw')
ON CONFLICT (name) DO NOTHING;

INSERT INTO conditions (name) VALUES
('Mint'),
('Near Mint'),
('Excellent'),
('Good'),
('Poor')
ON CONFLICT (name) DO NOTHING;
