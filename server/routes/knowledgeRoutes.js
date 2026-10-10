const express = require("express");

const pool = require("../config/database");

const {
  authenticateToken,
} = require("../auth/authMiddleware");

const {
  addKnowledgeDocument,
} = require("../services/knowledgeService");

const router = express.Router();

/* =========================
   GET KNOWLEDGE BASE
========================= */

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const query = `
        SELECT
          id,
          title,
          source,
          created_at,
          CASE
            WHEN embedding IS NOT NULL
            THEN true
            ELSE false
          END AS has_embedding
        FROM knowledge_documents
        ORDER BY created_at DESC;
      `;

      const result = await pool.query(query);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Knowledge Base Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Gagal mengambil knowledge base",
      });
    }
  }
);

/* =========================
   ADD KNOWLEDGE DOCUMENT
========================= */

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        title,
        content,
        source,
      } = req.body;

      const document =
        await addKnowledgeDocument({
          title,
          content,
          source,
        });

      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error(
        "Knowledge Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;