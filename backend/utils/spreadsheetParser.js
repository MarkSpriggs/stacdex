import xlsx from 'xlsx';
import { mapColumnHeaders } from './columnMapper.js';

/**
 * Parse Excel/CSV file buffer and extract rows
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} mimetype - File mimetype
 * @returns {Object} - { success, rows, columnMapping, ignoredColumns, errors }
 */
export function parseSpreadsheet(fileBuffer, mimetype) {
  try {
    // Parse workbook from buffer
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    if (!data || data.length === 0) {
      return {
        success: false,
        rows: [],
        errors: ['Spreadsheet is empty or has no data rows'],
      };
    }

    // Get headers from first row keys
    const headers = Object.keys(data[0]);

    // Map columns to database fields
    const { mapping, unmapped } = mapColumnHeaders(headers);

    // Transform rows using column mapping
    const transformedRows = data.map((row, index) => {
      const transformedRow = { _rowNumber: index + 2 }; // +2 because row 1 is header, 0-indexed

      for (const [excelHeader, dbField] of Object.entries(mapping)) {
        let value = row[excelHeader];

        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          transformedRow[dbField] = null;
          continue;
        }

        // Convert boolean fields
        if (dbField === 'rookie' || dbField === 'autograph') {
          transformedRow[dbField] = parseBoolean(value);
        }
        // Convert numeric fields
        else if (['year', 'numbered_to', 'patch_count'].includes(dbField)) {
          transformedRow[dbField] = value ? parseInt(value) : null;
        }
        // Convert decimal fields
        else if (['market_value', 'price_listed', 'grade_value'].includes(dbField)) {
          transformedRow[dbField] = value ? parseFloat(value) : null;
        }
        // String fields - trim whitespace
        else {
          transformedRow[dbField] = typeof value === 'string' ? value.trim() : value;
        }
      }

      return transformedRow;
    });

    return {
      success: true,
      rows: transformedRows,
      columnMapping: mapping,
      ignoredColumns: unmapped,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      rows: [],
      errors: [`Failed to parse spreadsheet: ${error.message}`],
    };
  }
}

/**
 * Convert various boolean representations to true/false
 */
function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  const str = String(value).toLowerCase().trim();
  if (['y', 'yes', 'true', '1'].includes(str)) return true;
  if (['n', 'no', 'false', '0', ''].includes(str)) return false;

  return false; // Default to false if unclear
}

/**
 * Validate rows for required fields and data types
 * @param {Array} rows - Transformed rows from parseSpreadsheet
 * @param {Object} lookupData - { categories, statuses, gradingCompanies, conditions }
 * @returns {Object} - { valid, errors }
 */
export function validateRows(rows, lookupData) {
  const errors = [];
  const { categories, statuses, gradingCompanies, conditions } = lookupData;

  // Create lookup maps (case-insensitive)
  const categoryMap = createLookupMap(categories);
  const statusMap = createLookupMap(statuses);
  const gradingMap = createLookupMap(gradingCompanies);
  const conditionMap = createLookupMap(conditions);

  for (const row of rows) {
    const rowNum = row._rowNumber;

    // Required: Title
    if (!row.title || row.title.trim() === '') {
      errors.push({
        row: rowNum,
        field: 'title',
        error: 'Title is required',
      });
    }

    // Required: Category
    if (!row.category || row.category.trim() === '') {
      errors.push({
        row: rowNum,
        field: 'category',
        error: 'Category is required',
      });
    } else if (!categoryMap[row.category.toLowerCase()]) {
      errors.push({
        row: rowNum,
        field: 'category',
        error: `Invalid category '${row.category}'. Must be: ${categories.map(c => c.name).join(', ')}`,
      });
    }

    // Optional fields (status, grading_company, condition) - invalid values will be set to null during import
    // No validation errors for optional fields, allowing imports to proceed with partial data

    // Validate year range
    if (row.year !== null && row.year !== undefined) {
      if (isNaN(row.year) || row.year < 1900 || row.year > 2025) {
        errors.push({
          row: rowNum,
          field: 'year',
          error: `Invalid year '${row.year}'. Must be between 1900 and 2025`,
        });
      }
    }

    // Validate grade value range
    if (row.grade_value !== null && row.grade_value !== undefined) {
      if (isNaN(row.grade_value) || row.grade_value < 0 || row.grade_value > 10) {
        errors.push({
          row: rowNum,
          field: 'grade_value',
          error: `Invalid grade value '${row.grade_value}'. Must be between 0 and 10`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create case-insensitive lookup map from array of objects with 'name' property
 */
function createLookupMap(items) {
  const map = {};
  for (const item of items) {
    map[item.name.toLowerCase()] = item;
  }
  return map;
}
