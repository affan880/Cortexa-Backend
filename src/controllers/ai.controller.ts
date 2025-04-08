import { Request, Response } from 'express';
import { generateAIResponse, generateAISummarization, generateSmartReply } from '../services/aiService';

export const askQuestion = async (req: Request, res: Response): Promise<void> => {
    console.log("askQuestion");
    const { input } = req.body;
    if (!input) {
        res.status(400).json({ error: "Question is required" });
        return;
    }

    try {
        const aiResponse = await generateAIResponse(input);
        res.json({ answer: aiResponse });
    } catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
};

export const summarization = async (req: Request, res: Response): Promise<void> => {
    console.log("summarization");
    const { subject, body} = req.body;
    if (!subject || !body) {
        res.status(400).json({ error: "Input text is required" });
        return;
    }

    try {
        const aiResponse = await generateAISummarization(subject, body);
        res.json({ answer: aiResponse });
    } catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
}; 

export const smartReply = async (req: Request, res: Response): Promise<void> => {
    console.log("smartReply");
    const { input } = req.body;
    if (!input) {
        res.status(400).json({ error: "Input text is required" });
        return;
    }

    try {
        const aiResponse = await generateSmartReply(input);
        res.json({ answer: aiResponse });
    }
    catch (error) {
        console.error("Error processing AI request:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
}