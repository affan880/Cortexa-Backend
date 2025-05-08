"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSmartReply = exports.generateAISummarization = exports.generateAIResponse = void 0;
const aiConfig_1 = require("../config/aiConfig");
const generateAIResponse = async (prompt) => {
    console.log("Generating AI response...", prompt);
    try {
        const result = await aiConfig_1.geminiApi.post("/", {
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        });
        console.log("Result:", result.data);
        const generatedText = result.data?.candidates[0].content.parts[0].text;
        return generatedText;
    }
    catch (error) {
        const axiosError = error;
        console.error("Error generating AI response:", axiosError.response?.data || axiosError.message);
        const errorMessage = axiosError.response?.data?.error?.message || axiosError.message;
        if (axiosError.response?.status === 404) {
            throw new Error(`API endpoint not found. Please check the API configuration: ${errorMessage}`);
        }
        throw new Error(`Failed to generate AI response: ${errorMessage}`);
    }
};
exports.generateAIResponse = generateAIResponse;
const generateAISummarization = async (subject, body) => {
    console.log("Generating AI response...", subject, body);
    try {
        const result = await aiConfig_1.barnApi.post("/", {
            inputs: `Summarize the following email. Focus on key actions or information.\n\nSubject: ${subject}\n\nBody: ${body}`,
        });
        const summaryData = result.data.data[0];
        const generatedText = summaryData?.summary_text;
        console.log("Result:", result);
        return generatedText ?? '';
    }
    catch (error) {
        const axiosError = error;
        console.error("Error generating AI response:", axiosError.response?.data || axiosError.message);
        const errorMessage = axiosError.response?.data?.error?.message || axiosError.message;
        if (axiosError.response?.status === 404) {
            throw new Error(`API endpoint not found. Please check the API configuration: ${errorMessage}`);
        }
        throw new Error(`Failed to generate AI response: ${errorMessage}`);
    }
};
exports.generateAISummarization = generateAISummarization;
const generateSmartReply = async (prompt) => {
    console.log("Generating smart reply...", prompt);
    try {
        const result = await aiConfig_1.smartReplies.post("/", {
            inputs: prompt,
        });
        const replyData = result.data.data[0];
        const generatedText = replyData?.generated_text;
        console.log("Result:", result);
        return generatedText ?? '';
    }
    catch (error) {
        const axiosError = error;
        console.error("Error generating smart reply:", axiosError.response?.data || axiosError.message);
        const errorMessage = axiosError.response?.data?.error?.message || axiosError.message;
        throw new Error(`Failed to generate smart reply: ${errorMessage}`);
    }
};
exports.generateSmartReply = generateSmartReply;
//# sourceMappingURL=aiService.js.map