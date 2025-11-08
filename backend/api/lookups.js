import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllCategories,
  getAllStatuses,
  getAllGradingCompanies,
  getAllConditions,
  getAllTeams,
} from "../db/queries/lookups.js";

const router = express.Router();

// =============================================================
// GET ALL CATEGORIES
// =============================================================
router.get("/categories", requireAuth, async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// =============================================================
// GET ALL STATUSES
// =============================================================
router.get("/statuses", requireAuth, async (req, res) => {
  try {
    const statuses = await getAllStatuses();
    res.json(statuses);
  } catch (err) {
    console.error("Error fetching statuses:", err);
    res.status(500).json({ error: "Failed to fetch statuses" });
  }
});

// =============================================================
// GET ALL GRADING COMPANIES
// =============================================================
router.get("/grading-companies", requireAuth, async (req, res) => {
  try {
    const companies = await getAllGradingCompanies();
    res.json(companies);
  } catch (err) {
    console.error("Error fetching grading companies:", err);
    res.status(500).json({ error: "Failed to fetch grading companies" });
  }
});

// =============================================================
// GET ALL CONDITIONS
// =============================================================
router.get("/conditions", requireAuth, async (req, res) => {
  try {
    const conditions = await getAllConditions();
    res.json(conditions);
  } catch (err) {
    console.error("Error fetching conditions:", err);
    res.status(500).json({ error: "Failed to fetch conditions" });
  }
});

// =============================================================
// GET ALL TEAMS (optionally filtered by category_id query param)
// =============================================================
router.get("/teams", requireAuth, async (req, res) => {
  try {
    const { category_id } = req.query;
    const teams = await getAllTeams(category_id || null);
    res.json(teams);
  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

export default router;
