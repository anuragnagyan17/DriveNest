import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY not configured.");
    return null;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
};

export default getGeminiModel;
