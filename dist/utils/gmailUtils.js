"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGmailTools = void 0;
const gmail_1 = require("@langchain/community/tools/gmail");
// Removed googleapis and OAuth2Client imports as they seem unnecessary here
// import { google } from "googleapis";
// import { OAuth2Client } from "google-auth-library";
// Removed BaseGmailTool import
// Return type is now StructuredTool[]
const createGmailTools = (accessToken) => {
    // Removed manual OAuth2 client creation
    console.log("Creating Gmail tools with access token...");
    // Instantiate tools, passing accessToken via credentials parameter
    const getThreadTool = new gmail_1.GmailGetThread({
        credentials: { accessToken: accessToken },
        // scopes: ["https://mail.google.com/"] // Scopes might not be needed with accessToken
    });
    // Instantiate GmailSearch (removed maxResults from constructor)
    const searchTool = new gmail_1.GmailSearch({
        credentials: { accessToken: accessToken },
    });
    // Add other tools as needed:
    // const sendMessageTool = new GmailSendMessage({ credentials: { accessToken: accessToken } });
    const tools = [getThreadTool, searchTool];
    console.log("Gmail tools created successfully:", tools.map(t => t.name));
    return tools; // Return an array of tool instances
};
exports.createGmailTools = createGmailTools;
//# sourceMappingURL=gmailUtils.js.map