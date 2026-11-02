const express = require("express");

const {
    authenticateToken
} = require("../auth/authMiddleware");

const {
    getUserConversations,
    getConversationHistory,
    getConversationById,
    deleteConversation
} = require("../services/conversationService");

const router = express.Router();

// GET /api/conversations
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await getUserConversations(userId);

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error("Get Conversations Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar percakapan"
        });
    }
});

// GET /api/conversations/:id
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;

        if (!/^\d+$/.test(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID"
            });
        }

        const conversation = await getConversationById(
            conversationId,
            userId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const messages = await getConversationHistory(
            conversationId,
            userId
        );

        res.json({
            success: true,
            data: {
                conversation,
                messages
            }
        });
    } catch (error) {
        console.error("Get Conversation Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil riwayat percakapan"
        });
    }
});

// DELETE /api/conversations/:id
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;

        if (!/^\d+$/.test(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID"
            });
        }

        const deleted = await deleteConversation(
            conversationId,
            userId
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        return res.json({
            success: true,
            message: "Percakapan berhasil dihapus"
        });
    } catch (error) {
        console.error("Delete Conversation Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal menghapus percakapan"
        });
    }
});

module.exports = router;