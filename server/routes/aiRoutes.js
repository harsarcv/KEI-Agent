
const express = require("express");
const { generateAIResponse } = require("../services/aiService");
const validateAIRequest = require("../middleware/validateAIRequest");

const {
    createConversation,
    saveMessage,
    getConversationHistory,
    getConversationById
} = require("../services/conversationService");

const router = express.Router();
const { authenticateToken } = require("../auth/authMiddleware");

router.post(
    "/chat",
    authenticateToken,
    validateAIRequest,
    async (req, res) => {
        let conversationId;

        try {
            const { message } = req.body;
            const userId = req.user.id;

            /*
             * 1. VALIDASI CONVERSATION ID
             */

            const requestedId = req.body.conversationId;

            if (requestedId !== undefined && requestedId !== null) {
                if (!/^\d+$/.test(String(requestedId))) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid conversation ID"
                    });
                }

                conversationId = String(requestedId);

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
            } else {
                /*
                 * 2. CREATE NEW CONVERSATION
                 */

                const conversation = await createConversation(
                    userId,
                    message.slice(0, 60)
                );

                conversationId = conversation.id;
            }

            /*
             * 3. GET CONVERSATION HISTORY
             */

            const historyData = await getConversationHistory(
                conversationId,
                userId
            );

            const limitedHistory = historyData
                .slice(-10)
                .map((item) => ({
                    role: item.role,
                    text: item.content
                }));

            /*
             * 4. SAVE USER MESSAGE
             */

            await saveMessage(
                conversationId,
                "user",
                message
            );

            /*
             * 5. SSE RESPONSE
             */

            res.setHeader(
                "Content-Type",
                "text/event-stream"
            );

            res.setHeader(
                "Cache-Control",
                "no-cache"
            );

            res.setHeader(
                "Connection",
                "keep-alive"
            );

            res.flushHeaders();

            const sendStatus = (status) => {
                res.write(
                    `data: ${JSON.stringify({
                        type: "status",
                        status
                    })}\n\n`
                );
            };

            /*
             * 6. GENERATE AI RESPONSE
             */

            const response = await generateAIResponse(
                message,
                (chunk) => {
                    res.write(
                        `data: ${JSON.stringify({
                            type: "chunk",
                            text: chunk
                        })}\n\n`
                    );
                },
                limitedHistory,
                sendStatus
            );

            /*
             * 7. SAVE ASSISTANT MESSAGE
             */

            await saveMessage(
                conversationId,
                "assistant",
                response.answer
            );

            /*
             * 8. COMPLETE RESPONSE
             */

            res.write(
                `data: ${JSON.stringify({
                    type: "complete",
                    data: {
                        conversationId,
                        answer: response.answer,
                        dataSource: response.dataSource,
                        toolUsed: response.toolUsed,
                        confidence: response.confidence
                    }
                })}\n\n`
            );

            res.write("data: [DONE]\n\n");
            res.end();

        } catch (error) {
            console.error(
                "AI Chat Error:",
                error.message
            );

            if (!res.headersSent) {
                return res.status(503).json({
                    success: false,
                    message: error.message
                });
            }

            res.write(
                `data: ${JSON.stringify({
                    type: "error",
                    message: error.message
                })}\n\n`
            );

            res.end();
        }
    }
);

module.exports = router;
