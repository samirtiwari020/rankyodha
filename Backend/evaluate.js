import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  console.log(`Testing ${modelName}...`);
  const start = Date.now();
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("reply with: { \"status\": \"ok\" }");
    const response = await result.response;
    console.log(`✅ ${modelName} SUCCESS: ${response.text().substring(0, 30)}... (${Date.now() - start}ms)`);
    return true;
  } catch (e) {
    console.log(`❌ ${modelName} FAILED: ${e.message.split('\n')[0]}`);
    return false;
  }
}

async function run() {
  const models = [
    'gemini-2.5-flash',
    'gemma-3-27b-it',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  
  for (const m of models) {
    await testModel(m);
  }
}
run();
