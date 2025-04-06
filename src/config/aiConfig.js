const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const geminiApi = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    key: process.env.GOOGLE_AI_API_KEY,
  },
});

module.exports = { geminiApi };
