"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarization = exports.askQuestion = void 0;
const aiService_1 = require("../services/aiService");
const askQuestion = async (req, res) => {
    console.log("askQuestion");
    const { question } = req.body;
    if (!question) {
        res.status(400).json({ error: "Question is required" });
        return;
    }
    try {
        const aiResponse = await (0, aiService_1.generateAIResponse)(question);
        res.json({ answer: aiResponse });
    }
    catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
};
exports.askQuestion = askQuestion;
const summarization = async (req, res) => {
    console.log("summarization");
    const { input } = req.body;
    if (!input) {
        res.status(400).json({ error: "Input text is required" });
        return;
    }
    try {
        const aiResponse = await (0, aiService_1.generateAISummarization)(input);
        res.json({ answer: aiResponse });
    }
    catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
};
exports.summarization = summarization;
//# sourceMappingURL=ai.controller.js.map