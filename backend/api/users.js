import express from "express";
import multer from "multer";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../middleware/s3.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../db/queries/users.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// =============================================================
// AUTH MIDDLEWARE — all routes require login
// =============================================================
router.use(requireAuth);

// =============================================================
// GET LOGGED-IN USER → GET /users/me
// =============================================================
router.get("/me", async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /users/me", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// =============================================================
// UPLOAD OR UPDATE PROFILE IMAGE → PUT /users/:id/profile-image
// =============================================================
router.put("/:id/profile-image", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id))
      return res.status(403).json({ error: "Unauthorized" });

    if (!req.file) return res.status(400).json({ error: "Image file required" });

    const safeFileName = req.file.originalname.replace(/\s+/g, "-");
    const fileKey = `profiles/${Date.now()}-${safeFileName}`;

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // Update DB
    const updated = await updateUser(id, { profile_image_url: imageUrl });

    res.status(200).json({
      message: "Profile image uploaded and user updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("🔥 Profile upload failed:", err);
    res.status(500).json({ error: "Failed to upload profile image", details: err.message });
  }
});

// =============================================================
// UPDATE USER (name/email/etc) → PUT /users/:id
// =============================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id))
      return res.status(403).json({ error: "Unauthorized" });

    const updated = await updateUser(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// =============================================================
// DELETE USER (and profile image from S3) → DELETE /users/:id
// =============================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id))
      return res.status(403).json({ error: "Unauthorized" });

    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete image from S3 if exists
    if (user.profile_image_url) {
      const key = decodeURIComponent(user.profile_image_url.split(".amazonaws.com/")[1]);
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
        console.log("🗑️ Deleted profile image:", key);
      } catch (s3Err) {
        console.warn("⚠️ Failed to delete S3 image:", s3Err.message);
      }
    }

    await deleteUser(id);
    res.json({ message: "User and profile image deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
