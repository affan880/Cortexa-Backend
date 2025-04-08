import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const geminiApi = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    key: process.env.GOOGLE_AI_API_KEY,
  },
});

export const barnApi = axios.create({
  baseURL: "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
  headers: {
    Authorization: `Bearer ${process.env.BARN_API_KEY}`,
    "Content-Type": "application/json",
  },
}); 

export const smartReplies = axios.create({
  baseURL: "https://router.huggingface.co/hf-inference/models/google/flan-t5-base",
  headers: {
    Authorization: `Bearer ${process.env.BARN_API_KEY}`,
    "Content-Type": "application/json",
  }
});