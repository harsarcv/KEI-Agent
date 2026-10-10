const express = require("express");
const { generateRAGResponse } = require("../services/ragService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    const result = await generateRAGResponse(question);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("RAG Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;