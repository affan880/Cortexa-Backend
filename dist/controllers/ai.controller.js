"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartReply = exports.summarization = exports.askQuestion = void 0;
const aiService_1 = require("../services/aiService");
const askQuestion = async (req, res) => {
    console.log("askQuestion");
    const { input } = req.body;
    if (!input) {
        res.status(400).json({ error: "Question is required" });
        return;
    }
    try {
        const aiResponse = await (0, aiService_1.generateAIResponse)(input);
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
    const { subject, body } = req.body;
    if (!subject || !body) {
        res.status(400).json({ error: "Input text is required" });
        return;
    }
    try {
        const aiResponse = await (0, aiService_1.generateAISummarization)(subject, body);
        res.json({ answer: aiResponse });
    }
    catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
};
exports.summarization = summarization;
const smartReply = async (req, res) => {
    console.log("smartReply");
    const { input } = req.body;
    if (!input) {
        res.status(400).json({ error: "Input text is required" });
        return;
    }
    try {
        const aiResponse = await (0, aiService_1.generateSmartReply)(input);
        res.json({ answer: aiResponse });
    }
    catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
};
exports.smartReply = smartReply;
//# sourceMappingURL=ai.controller.js.map