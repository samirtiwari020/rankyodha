import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI response using Google Gemini API
 * @param {string} prompt - The text prompt to send to the AI
 * @returns {Promise<string>} The AI's generated response text
 */
export const generateAIResponse = async (prompt) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined in environment variables");
        }
        
        // Use gemini-2.5-flash as the primary fast JSON model.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error.message.split('\n')[0]);
        if (error.message && error.message.includes("429 Too Many Requests")) {
            throw new Error("Google AI Free Tier Rate Limit Exceeded (max 20 requests per minute). Please take your hands off the keyboard and wait exactly 60 seconds before trying again.");
        }
        throw new Error("Failed to connect to the AI model: " + error.message.split('\n')[0]);
    }
};

export default generateAIResponse;
