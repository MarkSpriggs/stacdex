// Column mapping utility for bulk import
// Maps various column name variations to database fields

const COLUMN_MAPPINGS = {
  title: ['title', 'card title', 'name', 'card name'],
  category: ['category', 'sport', 'sport category', 'category name'],
  status: ['status', 'listing status', 'card status'],
  player_name: ['player', 'player name', 'playername', 'athlete', 'player_name'],
  team_name: ['team', 'team name', 'teamname', 'team_name'],
  year: ['year', 'card year', 'yr', 'season'],
  brand: ['brand', 'manufacturer', 'make'],
  sub_brand: ['sub brand', 'subbrand', 'set', 'subset', 'sub_brand'],
  rookie: ['rookie', 'rc', 'rookie card'],
  autograph: ['autograph', 'auto', 'signed', 'au', 'signature'],
  numbered_to: ['numbered to', 'numbered', "#'d to", '/99', 'numbered_to', 'serial'],
  patch_count: ['patch count', 'patches', 'patch', 'patch_count'],
  grading_company: ['grading company', 'grader', 'grade co', 'grading_company', 'grade company'],
  grade_value: ['grade value', 'grade', 'numeric grade', 'grade_value'],
  condition: ['condition', 'card condition'],
  market_value: ['market value', 'value', 'worth', 'price', 'market_value'],
  price_listed: ['price listed', 'list price', 'asking price', 'price_listed'],
  date_listed: ['date listed', 'listed date', 'list date', 'date_listed'],
  date_sold: ['date sold', 'sold date', 'sale date', 'date_sold'],
  ebay_url: ['ebay url', 'ebay link', 'url', 'link', 'ebay_url'],
  tags: ['tags', 'keywords', 'labels'],
};

/**
 * Normalizes a column header by:
 * - Converting to lowercase
 * - Trimming whitespace
 * - Replacing underscores, hyphens, and multiple spaces with single space
 */
function normalizeHeader(header) {
  if (!header) return '';
  return header
    .toLowerCase()
    .trim()
    .replace(/[_\s-]+/g, ' ')
    .trim();
}

/**
 * Maps Excel column headers to database field names
 * @param {Array<string>} headers - Array of column headers from spreadsheet
 * @returns {Object} - Mapping of { excelHeader: dbField }
 *
 * Unknown columns are NOT included in the mapping (they will be ignored)
 */
export function mapColumnHeaders(headers) {
  const mapping = {};
  const unmapped = [];

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    let matched = false;

    // Try to match against known variations
    for (const [dbField, variations] of Object.entries(COLUMN_MAPPINGS)) {
      if (variations.includes(normalized)) {
        mapping[header] = dbField;
        matched = true;
        break;
      }
    }

    if (!matched && normalized) {
      unmapped.push(header);
    }
  }

  return {
    mapping,
    unmapped, // Columns that will be ignored
  };
}

/**
 * Get list of all accepted column name variations for documentation
 */
export function getAcceptedColumnNames() {
  return COLUMN_MAPPINGS;
}
