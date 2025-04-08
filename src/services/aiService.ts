import { AxiosError } from 'axios';
import { geminiApi, barnApi, smartReplies } from '../config/aiConfig';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface BarnApiResponse {
    data: Array<{ summary_text: string }>;
}

interface SmartRepliesResponse {
  data: {
    generated_reply: string;
  };
}

export const generateAIResponse = async (prompt: string): Promise<string> => {
  console.log("Generating AI response...", prompt);
  try {
    const result = await geminiApi.post<GeminiResponse>("/", {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });
    console.log("Result:", result.data);
    const generatedText = result.data?.candidates[0].content.parts[0].text;
    return generatedText;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error generating AI response:", axiosError.response?.data || axiosError.message);
    const errorMessage = (axiosError.response?.data as any)?.error?.message || axiosError.message;
    if (axiosError.response?.status === 404) {
      throw new Error(`API endpoint not found. Please check the API configuration: ${errorMessage}`);
    }
    throw new Error(`Failed to generate AI response: ${errorMessage}`);
  }
};

export const generateAISummarization = async (subject: string, body: string): Promise<string> => {
  console.log("Generating AI response...", subject, body);
  try {
    const result = await barnApi.post<BarnApiResponse>("/", {
      inputs: `Summarize the following email. Focus on key actions or information.\n\nSubject: ${subject}\n\nBody: ${body}`,
    });
    const generatedText = result.data[0]?.summary_text;
    console.log("Result:", result);
    return generatedText ?? '';
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error generating AI response:", axiosError.response?.data || axiosError.message);
    const errorMessage = (axiosError.response?.data as any)?.error?.message || axiosError.message;
    if (axiosError.response?.status === 404) {
      throw new Error(`API endpoint not found. Please check the API configuration: ${errorMessage}`);
    }
    throw new Error(`Failed to generate AI response: ${errorMessage}`);
  }
}; 

export const generateSmartReply = async (prompt: string): Promise<string> => {
  console.log("Generating smart reply...", prompt);
  try {
    const result = await smartReplies.post<SmartRepliesResponse>("/", {
      inputs: prompt,
    });
    const generatedText = result.data[0]?.generated_text;
    console.log("Result:", result);
    return generatedText ?? '';
  }
  catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error generating smart reply:", axiosError.response?.data || axiosError.message);
    const errorMessage = (axiosError.response?.data as any)?.error?.message || axiosError.message;
    throw new Error(`Failed to generate smart reply: ${errorMessage}`);
  }
}