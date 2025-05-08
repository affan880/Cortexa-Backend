"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGmailAgent = void 0;
const openai_1 = require("@langchain/openai");
const agents_1 = require("langchain/agents");
const prompts_1 = require("@langchain/core/prompts");
// Simple prompt suitable for tool calling agents
const prompt = prompts_1.ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant processing Gmail information using available tools."],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
]);
const runGmailAgent = async (input, tools) => {
    // Check for OPENROUTER_API_KEY
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not found in environment variables.");
    }
    // Configure ChatOpenAI for OpenRouter with GPT-4o and strict maxTokens
    const llm = new openai_1.ChatOpenAI({
        modelName: "google/gemini-2.0-flash-exp:free",
        temperature: 0,
        maxTokens: 2000,
        configuration: {
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3001",
                "X-Title": process.env.YOUR_SITE_NAME || "TaskBox AI Agent",
            },
        },
    });
    // Use createToolCallingAgent
    const agent = await (0, agents_1.createToolCallingAgent)({
        llm,
        tools,
        prompt,
    });
    const agentExecutor = new agents_1.AgentExecutor({
        agent,
        tools,
        verbose: true,
    });
    console.log(`Running agent via OpenRouter (${llm.modelName}) with ToolCallingAgent, input: ${input}, tools: ${tools.map(t => t.name)}`);
    const result = await agentExecutor.invoke({ input });
    return result;
};
exports.runGmailAgent = runGmailAgent;
//# sourceMappingURL=gmailAgent.js.map