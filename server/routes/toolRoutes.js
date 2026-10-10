const express = require("express");
const analyticsTools = require("../tools/analyticsTools");

const router = express.Router();

router.post("/execute", async (req, res) => {
  try {
    const { tool } = req.body;

    if (!tool) {
      return res.status(400).json({
        success: false,
        message: "Tool is required",
      });
    }

    const selectedTool = analyticsTools[tool];

    if (!selectedTool) {
      return res.status(404).json({
        success: false,
        message: `Tool '${tool}' tidak ditemukan`,
      });
    }

    const result = await selectedTool.execute();

    res.json({
      success: true,
      tool,
      data: result,
    });
  } catch (error) {
    console.error("Tool Execution Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Gagal menjalankan tool",
    });
  }
});

module.exports = router;