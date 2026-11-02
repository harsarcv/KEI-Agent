const pool = require("../config/database");

const createConversation = async (userId, title = "New Conversation") => {
    const result = await pool.query(
        `INSERT INTO conversations (user_id, title)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, title]
    );

    return result.rows[0];
};

const saveMessage = async (conversationId, role, content) => {
    const result = await pool.query(
        `INSERT INTO messages (conversation_id, role, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [conversationId, role, content]
    );

    await pool.query(
        `UPDATE conversations
         SET updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [conversationId]
    );

    return result.rows[0];
};

const getConversationHistory = async (conversationId, userId) => {
    const result = await pool.query(
        `SELECT m.*
         FROM messages m
         JOIN conversations c
            ON c.id = m.conversation_id
         WHERE c.id = $1 AND c.user_id = $2
         ORDER BY m.created_at ASC`,
        [conversationId, userId]
    );

    return result.rows;
};

const getConversationById = async (conversationId, userId) => {
    const result = await pool.query(
        `SELECT *
         FROM conversations
         WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
    );

    return result.rows[0] || null;
};

const getUserConversations = async (userId) => {
    const result = await pool.query(
        `SELECT
            c.id,
            c.title,
            c.created_at,
            c.updated_at,
            COUNT(m.id)::INTEGER AS message_count
         FROM conversations c
         LEFT JOIN messages m
            ON m.conversation_id = c.id
         WHERE c.user_id = $1
         GROUP BY c.id
         ORDER BY c.updated_at DESC`,
        [userId]
    );

    return result.rows;
};

const deleteConversation = async (conversationId, userId) => {
    const result = await pool.query(
        `DELETE FROM conversations
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [conversationId, userId]
    );

    return result.rowCount > 0;
};

module.exports = {
    createConversation,
    saveMessage,
    getConversationHistory,
    getConversationById,
    getUserConversations,
    deleteConversation
};