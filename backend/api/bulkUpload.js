import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import { requireAuth } from "../middleware/auth.js";
import { parseSpreadsheet, validateRows } from "../utils/spreadsheetParser.js";
import { bulkCreateItems } from "../db/queries/bulkItems.js";
import {
  getAllCategories,
  getAllStatuses,
  getAllGradingCompanies,
  getAllConditions,
} from "../db/queries/lookups.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// =============================================================
// POST BULK UPLOAD - Upload and import spreadsheet
// =============================================================
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check file type
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Invalid file type. Please upload .xlsx, .xls, or .csv file",
      });
    }

    // Parse spreadsheet
    const parseResult = parseSpreadsheet(req.file.buffer, req.file.mimetype);

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Failed to parse spreadsheet",
        details: parseResult.errors,
      });
    }

    // Fetch lookup data for validation
    const [categories, statuses, gradingCompanies, conditions] = await Promise.all([
      getAllCategories(),
      getAllStatuses(),
      getAllGradingCompanies(),
      getAllConditions(),
    ]);

    const lookupData = {
      categories,
      statuses,
      gradingCompanies,
      conditions,
    };

    // Validate rows
    const validationResult = validateRows(parseResult.rows, lookupData);

    if (!validationResult.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.errors,
        columnMapping: parseResult.columnMapping,
        ignoredColumns: parseResult.ignoredColumns,
      });
    }

    // Bulk insert items
    const result = await bulkCreateItems(
      req.user.id,
      parseResult.rows,
      lookupData
    );

    res.status(201).json({
      success: true,
      imported: result.count,
      columnMapping: parseResult.columnMapping,
      ignoredColumns: parseResult.ignoredColumns,
      message: `Successfully imported ${result.count} card${result.count === 1 ? '' : 's'}`,
    });
  } catch (err) {
    console.error("Error in bulk upload:", err);
    res.status(500).json({
      error: "Failed to import cards",
      details: err.message,
    });
  }
});

// =============================================================
// GET TEMPLATE - Download Excel template
// =============================================================
router.get("/template", requireAuth, async (req, res) => {
  try {
    // Fetch lookup data for template
    const [categories, statuses, gradingCompanies, conditions] = await Promise.all([
      getAllCategories(),
      getAllStatuses(),
      getAllGradingCompanies(),
      getAllConditions(),
    ]);

    // Create workbook
    const workbook = xlsx.utils.book_new();

    // Sheet 1: Card Data with headers and example row
    const cardData = [
      [
        'Title',
        'Category',
        'Status',
        'Player Name',
        'Team Name',
        'Year',
        'Brand',
        'Sub Brand',
        'Rookie',
        'Autograph',
        'Numbered To',
        'Patch Count',
        'Grading Company',
        'Grade Value',
        'Condition',
        'Market Value',
        'Price Listed',
        'Date Listed',
        'Date Sold',
        'eBay URL',
        'Tags',
      ],
      [
        '2020 Panini Prizm Patrick Mahomes Silver',
        'Football',
        'Unlisted',
        'Patrick Mahomes',
        'Kansas City Chiefs',
        '2020',
        'Panini',
        'Prizm Silver',
        'No',
        'No',
        '',
        '',
        'PSA',
        '10',
        'Mint',
        '1500.00',
        '',
        '',
        '',
        '',
        'QB,Chiefs,Prizm',
      ],
    ];

    const cardSheet = xlsx.utils.aoa_to_sheet(cardData);
    xlsx.utils.book_append_sheet(workbook, cardSheet, 'Card Data');

    // Sheet 2: Instructions
    const instructions = [
      ['BULK IMPORT INSTRUCTIONS'],
      [''],
      ['REQUIRED FIELDS:'],
      ['- Title (card title/description)'],
      ['- Category (sport type)'],
      [''],
      ['OPTIONAL FIELDS:'],
      ['All other fields are optional and can be left blank'],
      [''],
      ['VALID VALUES:'],
      [''],
      ['Categories:'],
      [categories.map(c => c.name).join(', ')],
      [''],
      ['Statuses:'],
      [statuses.map(s => s.name).join(', ')],
      ['(Defaults to "Unlisted" if not provided)'],
      [''],
      ['Grading Companies:'],
      [gradingCompanies.map(g => g.name).join(', ')],
      [''],
      ['Conditions:'],
      [conditions.map(c => c.name).join(', ')],
      [''],
      ['BOOLEAN FIELDS (Rookie, Autograph):'],
      ['Accepted values: Y, N, Yes, No, True, False, 1, 0'],
      ['Leave blank for "No"'],
      [''],
      ['TEAM NAMES:'],
      ['Must match exact team name in system (case-insensitive)'],
      ['Examples: Kansas City Chiefs, Los Angeles Lakers, New York Yankees'],
      [''],
      ['DATE FORMATS:'],
      ['YYYY-MM-DD (e.g., 2024-01-15)'],
      ['OR MM/DD/YYYY (e.g., 01/15/2024)'],
      [''],
      ['TAGS:'],
      ['Comma-separated values (e.g., QB,Chiefs,Prizm)'],
      [''],
      ['COLUMN NAMES:'],
      ['Column headers are flexible and case-insensitive'],
      ['Examples: "Player Name" = "Player" = "PLAYER" = "athlete"'],
      ['Unknown columns will be ignored without error'],
      [''],
      ['NOTES:'],
      ['- All cards are imported in a single transaction'],
      ['- If any row fails validation, the entire import is rejected'],
      ['- Fix all errors and re-upload the file'],
      ['- Images are not supported in bulk import (add individually later)'],
    ];

    const instructionsSheet = xlsx.utils.aoa_to_sheet(instructions);
    xlsx.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KylesCards_Import_Template.xlsx');
    res.send(buffer);
  } catch (err) {
    console.error("Error generating template:", err);
    res.status(500).json({ error: "Failed to generate template" });
  }
});

export default router;
