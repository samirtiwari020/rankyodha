import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve('./.env') });
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testAvailableModels() {
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-pro',
    'learnlm-1.5-pro-experimental',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.0-pro-exp-02-05',
    'gemini-2.0-flash-thinking-exp-01-21',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'deep-research-pro-preview-1',
    'gemma-3-27b-it'
  ];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("hello");
      fs.writeFileSync('success.txt', modelName);
      console.log('Found:', modelName);
      process.exit(0);
    } catch (e) {
      console.log('Fail:', modelName);
    }
  }
  fs.writeFileSync('success.txt', 'NONE');
}
testAvailableModels();
