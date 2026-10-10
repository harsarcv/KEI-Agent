const pool = require("../config/database");
const { generateEmbedding } = require("./embeddingService");

const searchSimilarDocuments = async (query, limit = 5) => {
  if (!query || !query.trim()) {
    throw new Error("Search query is required");
  }

  const embedding = await generateEmbedding(query);

  const sql = `
    SELECT
      id,
      title,
      content,
      source,
      1 - (embedding <=> $1::vector) AS similarity
    FROM knowledge_documents
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $2;
  `;

  const result = await pool.query(sql, [
    JSON.stringify(embedding),
    limit,
  ]);

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    source: row.source,
    similarity: Number(row.similarity),
  }));
};

module.exports = {
  searchSimilarDocuments,
};