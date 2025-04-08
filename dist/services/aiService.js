"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAISummarization = exports.generateAIResponse = void 0;
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
        // const generatedText = result.data?.candidates[0].content.parts[0].text;
        // return generatedText;
        return "Hello";
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
const generateAISummarization = async (prompt) => {
    console.log("Generating AI response...", prompt);
    try {
        const result = await aiConfig_1.barnApi.post("/", {
            inputs: prompt,
        });
        console.log("Result:", result.data);
        // const generatedText = result.data?.candidates[0].content.parts[0].text;
        // return generatedText;
        return "Hello";
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
//# sourceMappingURL=aiService.js.map