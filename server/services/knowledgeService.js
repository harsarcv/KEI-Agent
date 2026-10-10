const pool = require("../config/database");
const { generateEmbedding } = require("./embeddingService");

const addKnowledgeDocument = async ({
  title,
  content,
  source,
}) => {
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const embedding = await generateEmbedding(content);

  const query = `
    INSERT INTO knowledge_documents
      (title, content, source, embedding)
    VALUES
      ($1, $2, $3, $4)
    RETURNING id, title, source, created_at;
  `;

  const result = await pool.query(query, [
    title,
    content,
    source || null,
    JSON.stringify(embedding),
  ]);

  return result.rows[0];
};

module.exports = {
  addKnowledgeDocument,
};