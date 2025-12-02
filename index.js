import OpenAI from "openai";
import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
const client = new OpenAI({
  apiKey: API_KEY,
});

const response = await client.responses.create({
  model: "gpt-5.1",
  input: "Write a short bedtime story about a unicorn.",
});

console.log(response.output_text);
