"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartReplies = exports.barnApi = exports.geminiApi = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.geminiApi = axios_1.default.create({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    headers: {
        "Content-Type": "application/json",
    },
    params: {
        key: process.env.GOOGLE_AI_API_KEY,
    },
});
exports.barnApi = axios_1.default.create({
    baseURL: "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
    headers: {
        Authorization: `Bearer ${process.env.BARN_API_KEY}`,
        "Content-Type": "application/json",
    },
});
exports.smartReplies = axios_1.default.create({
    baseURL: "https://router.huggingface.co/hf-inference/models/google/flan-t5-base",
    headers: {
        Authorization: `Bearer ${process.env.BARN_API_KEY}`,
        "Content-Type": "application/json",
    }
});
//# sourceMappingURL=aiConfig.js.map