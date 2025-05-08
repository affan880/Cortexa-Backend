"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIntent = void 0;
const cohere_ai_1 = require("cohere-ai");
const constants_1 = require("../config/constants");
const emailService_1 = require("./emailService");
const cohere = new cohere_ai_1.CohereClient({
    token: constants_1.COHERE_API_KEY
});
const detectIntent = async (userMessage) => {
    const prompt = `Analyze the following user message and determine their intent. The message is: "${userMessage}"

Possible intents:
1. Task Management:
   - create_task: Create a new task
   - show_tasks: View tasks
   - delete_task: Delete a task
   - update_task: Modify existing task
   - complete_task: Mark task as done
   - prioritize_task: Change task priority
   - search_tasks: Find specific tasks
   - filter_tasks: Filter tasks by criteria

2. Email Management:
   - send_email: Send new email
   - read_emails: View emails
   - delete_email: Remove email
   - reply_email: Reply to email
   - forward_email: Forward email
   - search_emails: Find emails
   - sort_emails: Organize emails

3. Calendar:
   - schedule_meeting: Create new meeting
   - view_calendar: Check calendar
   - reschedule_meeting: Change meeting time
   - cancel_meeting: Remove meeting
   - set_reminder: Create reminder

4. Analytics:
   - view_analytics: View statistics
   - get_statistics: Get specific stats
   - export_data: Export information
   - generate_report: Create report

5. Settings:
   - update_settings: Change settings
   - change_preferences: Modify preferences
   - manage_notifications: Update notifications
   - update_profile: Modify profile

6. Help & Support:
   - get_help: Request assistance
   - report_issue: Report problem
   - suggest_feature: Propose feature
   - view_documentation: Access docs

7. General:
   - question: Ask general question
   - greeting: Say hello
   - farewell: Say goodbye
   - unknown: Intent unclear

Extract relevant details based on the intent and respond with a JSON object in this format:
{
  "intent": "one_of_the_intents_above",
  "response": "a helpful response to the user",
  "metadata": {
    // Include relevant details based on the intent
    "taskDetails": { /* task-related fields */ },
    "emailDetails": { /* email-related fields */ },
    "calendarDetails": { /* calendar-related fields */ },
    "analyticsDetails": { /* analytics-related fields */ },
    "settingsDetails": { /* settings-related fields */ },
    // Common fields
    "taskId": "if applicable",
    "emailId": "if applicable",
    "eventId": "if applicable",
    "userId": "if applicable",
    "filters": { /* any filters specified */ },
    "searchQuery": "if searching"
  }
}

Only include metadata fields that are relevant to the detected intent.`;
    try {
        const response = await (0, emailService_1.callCohereWithTimeout)(prompt);
        // Extract the text content from Cohere response
        let responseText;
        if (typeof response === 'string') {
            responseText = response;
        }
        else if (response && typeof response === 'object') {
            // Handle Cohere response object
            const cohereResponse = response;
            if (cohereResponse.generations && cohereResponse.generations.length > 0) {
                responseText = cohereResponse.generations[0].text;
            }
            else if (cohereResponse.text) {
                responseText = cohereResponse.text;
            }
            else {
                responseText = JSON.stringify(response);
            }
        }
        else {
            throw new Error('Invalid response format from Cohere');
        }
        console.log('Raw Cohere response:', responseText);
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseText);
        }
        catch (parseError) {
            console.error('Error parsing Cohere response:', parseError);
            console.log('Failed to parse response:', responseText);
            return {
                intent: 'unknown',
                response: 'I apologize, but I had trouble processing your request. Could you please try again?'
            };
        }
        // Validate the response structure
        if (!parsedResponse.intent || !parsedResponse.response) {
            console.error('Invalid response structure:', parsedResponse);
            throw new Error('Invalid response structure from Cohere');
        }
        return {
            intent: parsedResponse.intent,
            response: parsedResponse.response,
            metadata: parsedResponse.metadata
        };
    }
    catch (error) {
        console.error('Error in intent detection:', error);
        return {
            intent: 'unknown',
            response: 'I apologize, but I had trouble understanding your request. Could you please rephrase it?'
        };
    }
};
exports.detectIntent = detectIntent;
//# sourceMappingURL=chatService.js.map