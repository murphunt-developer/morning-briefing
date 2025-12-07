import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { calculateAge } from './utils.js';
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
const client = new OpenAI({
  apiKey: API_KEY,
});

export const generateSummary = async (data) => {
  const response = await client.responses.create({
    model: 'gpt-5.1',
    input: `
    1. Please analyze the content of these 3 websites HTML: ${data} and identify potential headlines/articles. Mentally categorize each as Low_Impact, MID_IMPACT, HIGH_IMPACT, or MustRead. (do not output this categorization to me).

    2. Using the **MustRead** headlines (limit 3) generate a **STRICT Markdown table** using the following **EXACT** column headers: **Headline, Summary**.

      **STRICT Formatting Guidelines:**
      1.  **Table Structure:** The output must be a single, correctly formatted Markdown table with headers separated by pipes (|) and a separator line (---).
      2.  **Column Headers:** Use the 2 exact column headers listed above.
      3.  **Headline Column:** The headline with the complete URL as a hyperlink (starting with http:// or https://) for the article.
      4.  **Summary:** Provide a concise, analytical summary focused on strategic tension or implications (not a simple recap).
    `,
  });
  return response.output_text;
}

export const generateDailyKnowledgeTester = async (data) => {
  const age = calculateAge('1998-03-12');
  const response = await client.responses.create({
    model: 'gpt-5.1',
    input: `
      I am a ${age} year old male who is a software engineer. This prompt will be used as a daily question for myself to read in the morning to get ready for the day. 

      I am working on becoming a better engineer in the age of AI and would like for you to give me a question (not a project) that will help be increase my knowledge of relevant technology/ai based on current events.

      Please provide the output in two distinct parts, clearly labeled 'Question:' and 'Answer:', with a horizontal line break (---) separating the question from the answer.

      [Optional: Add constraints like 'Keep both the question and answer concise, each under 3 sentences.']
    `,
  });
  return response.output_text;
}