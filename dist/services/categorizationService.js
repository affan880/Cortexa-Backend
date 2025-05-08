"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineCategoryFromContent = determineCategoryFromContent;
const cohere_ai_1 = require("cohere-ai");
const constants_1 = require("../config/constants");
const emailService_1 = require("./emailService");
// Initialize Cohere
const cohere = new cohere_ai_1.CohereClient({
    token: constants_1.COHERE_API_KEY
});
async function determineCategoryFromContent(subject, body, labelIds, categories) {
    // First check if any of the labels directly match our categories
    const userLabelToCategoryMap = new Map();
    categories.forEach(cat => userLabelToCategoryMap.set(`Label_${cat.toUpperCase()}`, cat));
    for (const labelId of labelIds) {
        const normalizedLabelId = labelId.toLowerCase();
        if (userLabelToCategoryMap.has(normalizedLabelId)) {
            return userLabelToCategoryMap.get(normalizedLabelId);
        }
    }
    // If no direct matches, use Cohere for categorization
    const categorizationPrompt = `You are an expert email classifier. Your task is to deeply analyze the following email and categorize it based on its content, context, and intent into ONE of these categories: ${categories.join(", ")}.

Email Details:
Subject: ${subject}
Content: ${body}

Analysis Guidelines:
1. Content Analysis:
   - What is the main topic or subject matter?
   - What is the primary purpose of the email?
   - What action or response is expected?
   - What is the tone and context?

2. Intent Analysis:
   - What is the sender trying to achieve?
   - What is the expected outcome?
   - Is it informational, actionable, or both?
   - What is the urgency or priority level?

3. Context Analysis:
   - Who is the sender and what is their role?
   - What is the relationship between sender and recipient?
   - What is the broader context of the communication?
   - Are there any specific deadlines or time-sensitive elements?

4. Category Matching:
   - Match the analyzed content and intent to the most appropriate category
   - Consider both explicit and implicit meanings
   - Look for patterns and themes that align with the categories
   - Consider the overall purpose and impact of the email

Categorization Rules:
1. Primary Purpose: Identify the email's main purpose and choose the category that best represents it
2. Content Analysis: Consider the email's content, context, and intent
3. Keyword Matching: Look for specific keywords and patterns that indicate the category
4. Multiple Categories: If an email could fit multiple categories, choose the one that represents its primary purpose
5. Uncertainty: If the email doesn't clearly match any category, respond with "SKIP"
6. Response Format: Respond with ONLY the category name or "SKIP", nothing else

Important Notes:
- Focus on the email's primary purpose, not secondary topics
- Consider the sender's intent and the expected action
- Look for clear indicators in both subject and content
- Choose the most specific category that applies
- Categories can be anything: company names, person names, types of communication, or any other meaningful grouping
- Use the exact category name as provided, maintaining the same case and spelling
- Consider the broader context and implications of the email
- Look beyond just keywords to understand the true purpose and intent
- If the email doesn't clearly belong to any category, respond with "SKIP"
- Do not force categorization - it's better to skip than to miscategorize

Category:`;
    try {
        const categoryResponse = await (0, emailService_1.callCohereWithTimeout)(categorizationPrompt, 0.2);
        const rawCategory = categoryResponse.content.trim().toLowerCase();
        // Skip if the category is "skip" or doesn't match any requested category
        if (rawCategory === "skip") {
            return null;
        }
        const matchedCategory = categories.find(c => c.toLowerCase() === rawCategory.toLowerCase());
        return matchedCategory || null;
    }
    catch (error) {
        console.error("Error in Cohere categorization:", error);
        return null;
    }
}
//# sourceMappingURL=categorizationService.js.map