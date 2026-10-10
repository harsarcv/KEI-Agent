const express = require("express");
const { generateAIResponse } = require("../services/aiService");
const validateAIRequest = require("../middleware/validateAIRequest");

const router = express.Router();

const { authenticateToken } = require("../auth/authMiddleware");

router.post(
    "/chat",
    authenticateToken,
    validateAIRequest,
    async (req, res) => {
        try {
            const { message, history = [] } = req.body;

            if (!message || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Message is required",
                });
            }

            if (!Array.isArray(history)) {
                return res.status(400).json({
                    success: false,
                    message: "History must be an array",
                });
            }

            /*
             * ========================================================
             * BATASI HISTORY
             * ========================================================
             */

            const limitedHistory = history
                .slice(-10)
                .filter(
                    (item) =>
                        item &&
                        (item.role === "user" ||
                            item.role === "assistant") &&
                        typeof item.text === "string" &&
                        item.text.trim()
                )
                .map((item) => ({
                    role: item.role,
                    text: item.text.trim(),
                }));

            /*
             * ========================================================
             * SSE RESPONSE
             * ========================================================
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

            /*
             * ========================================================
             * STATUS CALLBACK
             * ========================================================
             */

            const sendStatus = (status) => {
                res.write(
                    `data: ${JSON.stringify({
                        type: "status",
                        status,
                    })}\n\n`
                );
            };

            /*
             * ========================================================
             * AI RESPONSE
             * ========================================================
             */

            const response = await generateAIResponse(
                message,
                (chunk) => {
                    res.write(
                        `data: ${JSON.stringify({
                            type: "chunk",
                            text: chunk,
                        })}\n\n`
                    );
                },
                limitedHistory,
                sendStatus
            );

            /*
             * ========================================================
             * COMPLETE
             * ========================================================
             */

            res.write(
                `data: ${JSON.stringify({
                    type: "complete",
                    data: {
                        answer: response.answer,
                        dataSource: response.dataSource,
                        toolUsed: response.toolUsed,
                        confidence: response.confidence,
                    },
                })}\n\n`
            );

            res.write("data: [DONE]\n\n");

            res.end();
        } catch (error) {
            console.error(
                "AI Chat Error:",
                error.message
            );

            /*
             * Jika header belum dikirim,
             * kirim response JSON biasa.
             */

            if (!res.headersSent) {
                return res.status(503).json({
                    success: false,
                    message: error.message,
                });
            }

            /*
             * Jika SSE sudah berjalan,
             * kirim error sebagai event SSE.
             */

            res.write(
                `data: ${JSON.stringify({
                    type: "error",
                    message: error.message,
                })}\n\n`
            );

            res.end();
        }
    }
);

module.exports = router;