const { geminiApi } = require("../config/aiConfig.js");

const generateAIResponse = async (prompt) => {
  console.log("Generating AI response...", prompt);
  try {
    const result = await geminiApi.post("/", {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    if (!result.data || !result.data.candidates || !result.data.candidates[0]) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const generatedText = result.data.candidates[0].content.parts[0].text;
    return generatedText;
  } catch (error) {
    console.error("Error generating AI response:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.error?.message || error.message;
    if (error.response?.status === 404) {
      throw new Error(`API endpoint not found. Please check the API configuration: ${errorMessage}`);
    }
    throw new Error(`Failed to generate AI response: ${errorMessage}`);
  }
};

module.exports = { generateAIResponse };
