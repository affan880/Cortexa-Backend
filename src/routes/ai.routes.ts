import express from 'express';
import { askQuestion, summarization, smartReply } from '../controllers/ai.controller';

const router = express.Router();

router.post("/ask", askQuestion);
router.post("/summarize", summarization);
router.post("/smart-reply", smartReply);
export default router; 