const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const toolRoutes = require("./routes/toolRoutes");
const knowledgeRoutes = require("./routes/knowledgeRoutes");
const searchRoutes = require("./routes/searchRoutes");
const ragRoutes = require("./routes/ragRoutes");
const authRoutes = require("./auth/authRoutes");

require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "KEI Backend is running",
  });
});

app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`KEI Backend running on http://localhost:${PORT}`);
});