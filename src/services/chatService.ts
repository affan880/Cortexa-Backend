import { CohereClient } from 'cohere-ai';
import { COHERE_API_KEY, COHERE_SETTINGS } from '../config/constants';
import { callCohereWithTimeout } from './emailService';

const cohere = new CohereClient({
  token: COHERE_API_KEY
});

export type ChatIntent = 
  // Task Management Intents
  | 'create_task'
  | 'show_tasks'
  | 'delete_task'
  | 'update_task'
  | 'complete_task'
  | 'prioritize_task'
  | 'search_tasks'
  | 'filter_tasks'
  
  // Email Management Intents
  | 'send_email'
  | 'read_emails'
  | 'delete_email'
  | 'reply_email'
  | 'forward_email'
  | 'search_emails'
  | 'sort_emails'
  
  // Calendar Intents
  | 'schedule_meeting'
  | 'view_calendar'
  | 'reschedule_meeting'
  | 'cancel_meeting'
  | 'set_reminder'
  
  // Analytics Intents
  | 'view_analytics'
  | 'get_statistics'
  | 'export_data'
  | 'generate_report'
  
  // Settings Intents
  | 'update_settings'
  | 'change_preferences'
  | 'manage_notifications'
  | 'update_profile'
  
  // Help & Support Intents
  | 'get_help'
  | 'report_issue'
  | 'suggest_feature'
  | 'view_documentation'
  
  // General Intents
  | 'question'
  | 'greeting'
  | 'farewell'
  | 'unknown';

export interface ChatResponse {
  intent: ChatIntent;
  response: string;
  metadata?: {
    // Task Management Metadata
    taskDetails?: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: 'high' | 'medium' | 'low';
      status?: 'pending' | 'in_progress' | 'completed';
      tags?: string[];
      assignee?: string;
    };
    
    // Email Management Metadata
    emailDetails?: {
      recipient?: string;
      subject?: string;
      body?: string;
      attachments?: string[];
      cc?: string[];
      bcc?: string[];
      priority?: 'high' | 'normal' | 'low';
    };
    
    // Calendar Metadata
    calendarDetails?: {
      eventTitle?: string;
      startTime?: string;
      endTime?: string;
      attendees?: string[];
      location?: string;
      description?: string;
      reminderTime?: string;
    };
    
    // Analytics Metadata
    analyticsDetails?: {
      dateRange?: {
        start?: string;
        end?: string;
      };
      metrics?: string[];
      format?: 'pdf' | 'csv' | 'excel';
    };
    
    // Settings Metadata
    settingsDetails?: {
      category?: string;
      value?: any;
      notificationType?: string;
      preferenceKey?: string;
    };
    
    // Common Metadata
    taskId?: string;
    emailId?: string;
    eventId?: string;
    userId?: string;
    filters?: {
      [key: string]: any;
    };
    searchQuery?: string;
  };
}

export const detectIntent = async (userMessage: string): Promise<ChatResponse> => {
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
    const response = await callCohereWithTimeout(prompt);
    
    // Extract the text content from Cohere response
    let responseText: string;
    if (typeof response === 'string') {
      responseText = response;
    } else if (response && typeof response === 'object') {
      // Handle Cohere response object
      const cohereResponse = response as { generations?: Array<{ text: string }>; text?: string };
      if (cohereResponse.generations && cohereResponse.generations.length > 0) {
        responseText = cohereResponse.generations[0].text;
      } else if (cohereResponse.text) {
        responseText = cohereResponse.text;
      } else {
        responseText = JSON.stringify(response);
      }
    } else {
      throw new Error('Invalid response format from Cohere');
    }

    console.log('Raw Cohere response:', responseText);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
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
      intent: parsedResponse.intent as ChatIntent,
      response: parsedResponse.response,
      metadata: parsedResponse.metadata
    };
  } catch (error) {
    console.error('Error in intent detection:', error);
    return {
      intent: 'unknown',
      response: 'I apologize, but I had trouble understanding your request. Could you please rephrase it?'
    };
  }
}; 