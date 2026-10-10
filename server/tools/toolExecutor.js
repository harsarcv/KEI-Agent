const analyticsTools = require("./analyticsTools");

const executeTool = async (toolName, args = {}) => {
  if (!toolName || typeof toolName !== "string") {
    throw new Error("Tool name tidak valid");
  }

  const tool = analyticsTools[toolName];

  if (!tool || typeof tool.execute !== "function") {
    throw new Error(`Tool '${toolName}' tidak ditemukan`);
  }

  try {
    return await tool.execute(args);
  } catch (error) {
    console.error(
      `Tool execution error [${toolName}]:`,
      error.message
    );

    throw new Error(
      `Gagal menjalankan tool '${toolName}'`
    );
  }
};

module.exports = {
  executeTool,
};