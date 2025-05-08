import { 
  GmailGetThread, 
  GmailSearch
} from "@langchain/community/tools/gmail";
import { StructuredTool } from "@langchain/core/tools";
// Removed googleapis and OAuth2Client imports as they seem unnecessary here
// import { google } from "googleapis";
// import { OAuth2Client } from "google-auth-library";
// Removed BaseGmailTool import

// Return type is now StructuredTool[]
export const createGmailTools = (accessToken: string): StructuredTool[] => {
  // Removed manual OAuth2 client creation

  console.log("Creating Gmail tools with access token...");
  
  // Instantiate tools, passing accessToken via credentials parameter
  const getThreadTool = new GmailGetThread({
    credentials: {
      clientEmail: "user",
      privateKey: accessToken
    }
  });

  // Instantiate GmailSearch (removed maxResults from constructor)
  const searchTool = new GmailSearch({ 
    credentials: {
      clientEmail: "user",
      privateKey: accessToken
    }
  });

  // Add other tools as needed:
  // const sendMessageTool = new GmailSendMessage({ credentials: { accessToken: accessToken } });

  const tools = [getThreadTool, searchTool];

  console.log("Gmail tools created successfully:", tools.map(t => t.name));
  return tools; // Return an array of tool instances
}; 