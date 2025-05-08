export type ChatIntent = 'create_task' | 'show_tasks' | 'delete_task' | 'update_task' | 'complete_task' | 'prioritize_task' | 'search_tasks' | 'filter_tasks' | 'send_email' | 'read_emails' | 'delete_email' | 'reply_email' | 'forward_email' | 'search_emails' | 'sort_emails' | 'schedule_meeting' | 'view_calendar' | 'reschedule_meeting' | 'cancel_meeting' | 'set_reminder' | 'view_analytics' | 'get_statistics' | 'export_data' | 'generate_report' | 'update_settings' | 'change_preferences' | 'manage_notifications' | 'update_profile' | 'get_help' | 'report_issue' | 'suggest_feature' | 'view_documentation' | 'question' | 'greeting' | 'farewell' | 'unknown';
export interface ChatResponse {
    intent: ChatIntent;
    response: string;
    metadata?: {
        taskDetails?: {
            title?: string;
            description?: string;
            dueDate?: string;
            priority?: 'high' | 'medium' | 'low';
            status?: 'pending' | 'in_progress' | 'completed';
            tags?: string[];
            assignee?: string;
        };
        emailDetails?: {
            recipient?: string;
            subject?: string;
            body?: string;
            attachments?: string[];
            cc?: string[];
            bcc?: string[];
            priority?: 'high' | 'normal' | 'low';
        };
        calendarDetails?: {
            eventTitle?: string;
            startTime?: string;
            endTime?: string;
            attendees?: string[];
            location?: string;
            description?: string;
            reminderTime?: string;
        };
        analyticsDetails?: {
            dateRange?: {
                start?: string;
                end?: string;
            };
            metrics?: string[];
            format?: 'pdf' | 'csv' | 'excel';
        };
        settingsDetails?: {
            category?: string;
            value?: any;
            notificationType?: string;
            preferenceKey?: string;
        };
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
export declare const detectIntent: (userMessage: string) => Promise<ChatResponse>;
