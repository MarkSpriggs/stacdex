-- ==============================================================
-- STACDEX DATABASE SCHEMA (with S3 image fields)
-- ==============================================================

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS teams;
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

-- Teams (organized by sport category)
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(name, category_id)
);
CREATE INDEX idx_teams_category_id ON teams(category_id);

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

-- ==============================================================
-- TEAMS SEED DATA
-- ==============================================================

-- Football Teams (NFL)
INSERT INTO teams (name, category_id) VALUES
('Arizona Cardinals', (SELECT id FROM categories WHERE name = 'Football')),
('Atlanta Falcons', (SELECT id FROM categories WHERE name = 'Football')),
('Baltimore Ravens', (SELECT id FROM categories WHERE name = 'Football')),
('Buffalo Bills', (SELECT id FROM categories WHERE name = 'Football')),
('Carolina Panthers', (SELECT id FROM categories WHERE name = 'Football')),
('Chicago Bears', (SELECT id FROM categories WHERE name = 'Football')),
('Cincinnati Bengals', (SELECT id FROM categories WHERE name = 'Football')),
('Cleveland Browns', (SELECT id FROM categories WHERE name = 'Football')),
('Dallas Cowboys', (SELECT id FROM categories WHERE name = 'Football')),
('Denver Broncos', (SELECT id FROM categories WHERE name = 'Football')),
('Detroit Lions', (SELECT id FROM categories WHERE name = 'Football')),
('Green Bay Packers', (SELECT id FROM categories WHERE name = 'Football')),
('Houston Texans', (SELECT id FROM categories WHERE name = 'Football')),
('Indianapolis Colts', (SELECT id FROM categories WHERE name = 'Football')),
('Jacksonville Jaguars', (SELECT id FROM categories WHERE name = 'Football')),
('Kansas City Chiefs', (SELECT id FROM categories WHERE name = 'Football')),
('Las Vegas Raiders', (SELECT id FROM categories WHERE name = 'Football')),
('Los Angeles Chargers', (SELECT id FROM categories WHERE name = 'Football')),
('Los Angeles Rams', (SELECT id FROM categories WHERE name = 'Football')),
('Miami Dolphins', (SELECT id FROM categories WHERE name = 'Football')),
('Minnesota Vikings', (SELECT id FROM categories WHERE name = 'Football')),
('New England Patriots', (SELECT id FROM categories WHERE name = 'Football')),
('New Orleans Saints', (SELECT id FROM categories WHERE name = 'Football')),
('New York Giants', (SELECT id FROM categories WHERE name = 'Football')),
('New York Jets', (SELECT id FROM categories WHERE name = 'Football')),
('Philadelphia Eagles', (SELECT id FROM categories WHERE name = 'Football')),
('Pittsburgh Steelers', (SELECT id FROM categories WHERE name = 'Football')),
('San Francisco 49ers', (SELECT id FROM categories WHERE name = 'Football')),
('Seattle Seahawks', (SELECT id FROM categories WHERE name = 'Football')),
('Tampa Bay Buccaneers', (SELECT id FROM categories WHERE name = 'Football')),
('Tennessee Titans', (SELECT id FROM categories WHERE name = 'Football')),
('Washington Commanders', (SELECT id FROM categories WHERE name = 'Football'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Baseball Teams (MLB)
INSERT INTO teams (name, category_id) VALUES
('Arizona Diamondbacks', (SELECT id FROM categories WHERE name = 'Baseball')),
('Atlanta Braves', (SELECT id FROM categories WHERE name = 'Baseball')),
('Baltimore Orioles', (SELECT id FROM categories WHERE name = 'Baseball')),
('Boston Red Sox', (SELECT id FROM categories WHERE name = 'Baseball')),
('Chicago Cubs', (SELECT id FROM categories WHERE name = 'Baseball')),
('Chicago White Sox', (SELECT id FROM categories WHERE name = 'Baseball')),
('Cincinnati Reds', (SELECT id FROM categories WHERE name = 'Baseball')),
('Cleveland Guardians', (SELECT id FROM categories WHERE name = 'Baseball')),
('Colorado Rockies', (SELECT id FROM categories WHERE name = 'Baseball')),
('Detroit Tigers', (SELECT id FROM categories WHERE name = 'Baseball')),
('Houston Astros', (SELECT id FROM categories WHERE name = 'Baseball')),
('Kansas City Royals', (SELECT id FROM categories WHERE name = 'Baseball')),
('Los Angeles Angels', (SELECT id FROM categories WHERE name = 'Baseball')),
('Los Angeles Dodgers', (SELECT id FROM categories WHERE name = 'Baseball')),
('Miami Marlins', (SELECT id FROM categories WHERE name = 'Baseball')),
('Milwaukee Brewers', (SELECT id FROM categories WHERE name = 'Baseball')),
('Minnesota Twins', (SELECT id FROM categories WHERE name = 'Baseball')),
('New York Mets', (SELECT id FROM categories WHERE name = 'Baseball')),
('New York Yankees', (SELECT id FROM categories WHERE name = 'Baseball')),
('Oakland Athletics', (SELECT id FROM categories WHERE name = 'Baseball')),
('Philadelphia Phillies', (SELECT id FROM categories WHERE name = 'Baseball')),
('Pittsburgh Pirates', (SELECT id FROM categories WHERE name = 'Baseball')),
('San Diego Padres', (SELECT id FROM categories WHERE name = 'Baseball')),
('San Francisco Giants', (SELECT id FROM categories WHERE name = 'Baseball')),
('Seattle Mariners', (SELECT id FROM categories WHERE name = 'Baseball')),
('St. Louis Cardinals', (SELECT id FROM categories WHERE name = 'Baseball')),
('Tampa Bay Rays', (SELECT id FROM categories WHERE name = 'Baseball')),
('Texas Rangers', (SELECT id FROM categories WHERE name = 'Baseball')),
('Toronto Blue Jays', (SELECT id FROM categories WHERE name = 'Baseball')),
('Washington Nationals', (SELECT id FROM categories WHERE name = 'Baseball'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Basketball Teams (NBA)
INSERT INTO teams (name, category_id) VALUES
('Atlanta Hawks', (SELECT id FROM categories WHERE name = 'Basketball')),
('Boston Celtics', (SELECT id FROM categories WHERE name = 'Basketball')),
('Brooklyn Nets', (SELECT id FROM categories WHERE name = 'Basketball')),
('Charlotte Hornets', (SELECT id FROM categories WHERE name = 'Basketball')),
('Chicago Bulls', (SELECT id FROM categories WHERE name = 'Basketball')),
('Cleveland Cavaliers', (SELECT id FROM categories WHERE name = 'Basketball')),
('Dallas Mavericks', (SELECT id FROM categories WHERE name = 'Basketball')),
('Denver Nuggets', (SELECT id FROM categories WHERE name = 'Basketball')),
('Detroit Pistons', (SELECT id FROM categories WHERE name = 'Basketball')),
('Golden State Warriors', (SELECT id FROM categories WHERE name = 'Basketball')),
('Houston Rockets', (SELECT id FROM categories WHERE name = 'Basketball')),
('Indiana Pacers', (SELECT id FROM categories WHERE name = 'Basketball')),
('Los Angeles Clippers', (SELECT id FROM categories WHERE name = 'Basketball')),
('Los Angeles Lakers', (SELECT id FROM categories WHERE name = 'Basketball')),
('Memphis Grizzlies', (SELECT id FROM categories WHERE name = 'Basketball')),
('Miami Heat', (SELECT id FROM categories WHERE name = 'Basketball')),
('Milwaukee Bucks', (SELECT id FROM categories WHERE name = 'Basketball')),
('Minnesota Timberwolves', (SELECT id FROM categories WHERE name = 'Basketball')),
('New Orleans Pelicans', (SELECT id FROM categories WHERE name = 'Basketball')),
('New York Knicks', (SELECT id FROM categories WHERE name = 'Basketball')),
('Oklahoma City Thunder', (SELECT id FROM categories WHERE name = 'Basketball')),
('Orlando Magic', (SELECT id FROM categories WHERE name = 'Basketball')),
('Philadelphia 76ers', (SELECT id FROM categories WHERE name = 'Basketball')),
('Phoenix Suns', (SELECT id FROM categories WHERE name = 'Basketball')),
('Portland Trail Blazers', (SELECT id FROM categories WHERE name = 'Basketball')),
('Sacramento Kings', (SELECT id FROM categories WHERE name = 'Basketball')),
('San Antonio Spurs', (SELECT id FROM categories WHERE name = 'Basketball')),
('Toronto Raptors', (SELECT id FROM categories WHERE name = 'Basketball')),
('Utah Jazz', (SELECT id FROM categories WHERE name = 'Basketball')),
('Washington Wizards', (SELECT id FROM categories WHERE name = 'Basketball'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Hockey Teams (NHL)
INSERT INTO teams (name, category_id) VALUES
('Anaheim Ducks', (SELECT id FROM categories WHERE name = 'Hockey')),
('Arizona Coyotes', (SELECT id FROM categories WHERE name = 'Hockey')),
('Boston Bruins', (SELECT id FROM categories WHERE name = 'Hockey')),
('Buffalo Sabres', (SELECT id FROM categories WHERE name = 'Hockey')),
('Calgary Flames', (SELECT id FROM categories WHERE name = 'Hockey')),
('Carolina Hurricanes', (SELECT id FROM categories WHERE name = 'Hockey')),
('Chicago Blackhawks', (SELECT id FROM categories WHERE name = 'Hockey')),
('Colorado Avalanche', (SELECT id FROM categories WHERE name = 'Hockey')),
('Columbus Blue Jackets', (SELECT id FROM categories WHERE name = 'Hockey')),
('Dallas Stars', (SELECT id FROM categories WHERE name = 'Hockey')),
('Detroit Red Wings', (SELECT id FROM categories WHERE name = 'Hockey')),
('Edmonton Oilers', (SELECT id FROM categories WHERE name = 'Hockey')),
('Florida Panthers', (SELECT id FROM categories WHERE name = 'Hockey')),
('Los Angeles Kings', (SELECT id FROM categories WHERE name = 'Hockey')),
('Minnesota Wild', (SELECT id FROM categories WHERE name = 'Hockey')),
('Montreal Canadiens', (SELECT id FROM categories WHERE name = 'Hockey')),
('Nashville Predators', (SELECT id FROM categories WHERE name = 'Hockey')),
('New Jersey Devils', (SELECT id FROM categories WHERE name = 'Hockey')),
('New York Islanders', (SELECT id FROM categories WHERE name = 'Hockey')),
('New York Rangers', (SELECT id FROM categories WHERE name = 'Hockey')),
('Ottawa Senators', (SELECT id FROM categories WHERE name = 'Hockey')),
('Philadelphia Flyers', (SELECT id FROM categories WHERE name = 'Hockey')),
('Pittsburgh Penguins', (SELECT id FROM categories WHERE name = 'Hockey')),
('San Jose Sharks', (SELECT id FROM categories WHERE name = 'Hockey')),
('Seattle Kraken', (SELECT id FROM categories WHERE name = 'Hockey')),
('St. Louis Blues', (SELECT id FROM categories WHERE name = 'Hockey')),
('Tampa Bay Lightning', (SELECT id FROM categories WHERE name = 'Hockey')),
('Toronto Maple Leafs', (SELECT id FROM categories WHERE name = 'Hockey')),
('Utah Hockey Club', (SELECT id FROM categories WHERE name = 'Hockey')),
('Vancouver Canucks', (SELECT id FROM categories WHERE name = 'Hockey')),
('Vegas Golden Knights', (SELECT id FROM categories WHERE name = 'Hockey')),
('Washington Capitals', (SELECT id FROM categories WHERE name = 'Hockey')),
('Winnipeg Jets', (SELECT id FROM categories WHERE name = 'Hockey'))
ON CONFLICT (name, category_id) DO NOTHING;
