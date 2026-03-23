import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';

// Load env explicitly
dotenv.config({ path: path.resolve('./.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log('No API key found in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log('Available models:');
    const modelNames = data.models
      .filter(m => m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name);
    console.log(modelNames);
    
    // Pick the first available model that has flash or pro in it
    const recommended = modelNames.find(name => name.includes('gemini-1.5-flash')) 
      || modelNames.find(name => name.includes('flash')) 
      || modelNames.find(name => name.includes('pro'))
      || modelNames[0];
      
    console.log('\nRECOMMENDED MODEL:', recommended.replace('models/', ''));
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

checkModels();
