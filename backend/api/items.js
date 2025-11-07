import express from "express";
import multer from "multer";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../middleware/s3.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createItem,
  getAllItems,
  getItemById,
  getItemsByUser,
  updateItem,
  deleteItem,
} from "../db/queries/items.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// =============================================================
// GET ITEMS (for logged-in user only)
// =============================================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await getItemsByUser(req.user.id);
    res.json(items);
  } catch (err) {
    console.error("Error fetching user's items:", err);
    res.status(500).json({ error: "Failed to fetch user's items" });
  }
});

// =============================================================
// GET ITEM BY ID
// =============================================================
router.get("/:id", async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// =============================================================
// CREATE ITEM + IMAGE UPLOAD
// =============================================================
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const safeFileName = req.file ? req.file.originalname.replace(/\s+/g, "-") : null;
    const fileKey = safeFileName ? `cards/${Date.now()}-${safeFileName}` : null;

    let imageUrl = null;
    if (req.file) {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: fileKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }

    const newItem = await createItem({
      user_id: req.user.id,
      ...req.body,
      image_url: imageUrl,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// =============================================================
// UPDATE ITEM + IMAGE (optional new upload)
// =============================================================
router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getItemById(id);
    if (!existing) return res.status(404).json({ error: "Item not found" });
    if (existing.user_id !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    let updatedFields = { ...req.body };

    if (req.file) {
      const safeFileName = req.file.originalname.replace(/\s+/g, "-");
      const fileKey = `cards/${Date.now()}-${safeFileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: fileKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      // delete old image if exists
      if (existing.image_url) {
        const oldKey = decodeURIComponent(existing.image_url.split(".amazonaws.com/")[1]);
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: oldKey }));
      }

      updatedFields.image_url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }

    const updated = await updateItem(id, updatedFields);
    res.json(updated);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// =============================================================
// DELETE ITEM + IMAGE
// =============================================================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.user_id !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    if (item.image_url) {
      const key = decodeURIComponent(item.image_url.split(".amazonaws.com/")[1]);
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
      console.log("🗑️ Deleted card image:", key);
    }

    await deleteItem(req.params.id);
    res.json({ message: "Item and image deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
