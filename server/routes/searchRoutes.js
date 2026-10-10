const express = require("express");
const {
  searchSimilarDocuments,
} = require("../services/vectorSearchService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    const results = await searchSimilarDocuments(query);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Vector Search Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;