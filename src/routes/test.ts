import { Router, Request, Response, NextFunction } from 'express';
import { ChatOllama } from "@langchain/community/chat_models/ollama"; // Import ChatOllama

const router = Router();

console.log("--- Loading src/routes/test.ts ---");

// --- Test Endpoint --- 

router.get('/test-ollama', async (req: Request, res: Response, next: NextFunction) => {
  console.log("--- Reached GET /test-ollama handler ---");
  const ollamaHost = "http://192.168.1.79:11434"; // Use the provided IP
  const modelName = "mistral"; // Use the specified model

  try {
    console.log(`Attempting to connect to Ollama at ${ollamaHost} with model ${modelName}...`);
    
    const llm = new ChatOllama({
      baseUrl: ollamaHost,
      model: modelName,
      temperature: 0.1 // Add a low temperature for basic testing
    });

    console.log("Ollama model instantiated. Sending test prompt...");
    const testPrompt = "Briefly introduce yourself.";
    const result = await llm.invoke(testPrompt);

    console.log("Ollama responded successfully.");
    res.json({ 
      message: "Successfully connected to Ollama and got response.", 
      prompt: testPrompt,
      response: result.content // Extract content from AIChatMessage
    });

  } catch (error) {
    console.error(`Error testing Ollama connection to ${ollamaHost}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Failed to connect to Ollama or get response", 
      details: errorMessage, 
      host: ollamaHost, 
      model: modelName 
    });
  }
});

export default router; 