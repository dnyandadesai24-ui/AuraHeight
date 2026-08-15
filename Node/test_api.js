const OpenAI = require("openai");

const openAiClient = new OpenAI({
  apiKey: process.env.OPENROUTERKEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "My Chatbot",
  },
});

async function test() {
  try {
    const response = await openAiClient.chat.completions.create({
      model: "poolside/laguna-s-2.1:free",
      messages: [{ role: "system", content: "You are a bot" }, { role: "user", content: "Hello" }],
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

test();
