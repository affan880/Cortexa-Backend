import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";

// Simple prompt suitable for tool calling agents
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant processing Gmail information using available tools."],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

export const runGmailAgent = async (input: string, tools: StructuredTool[]) => {
  // Check for OPENROUTER_API_KEY
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not found in environment variables.");
  }

  // Configure ChatOpenAI for OpenRouter with GPT-4o and strict maxTokens
  const llm = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    modelName: "google/gemini-2.0-flash-exp:free",
    temperature: 0,
    maxTokens: 2000,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3001",
        "X-Title": process.env.YOUR_SITE_NAME || "TaskBox AI Agent",
      },
    },
  });

  // Use createToolCallingAgent
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  console.log(`Running agent via OpenRouter (${llm.modelName}) with ToolCallingAgent, input: ${input}, tools: ${tools.map(t => t.name)}`);
  const result = await agentExecutor.invoke({ input });

  return result;
}; 