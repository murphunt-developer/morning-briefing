import OpenAI from "openai";
import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
const client = new OpenAI({
  apiKey: API_KEY,
});

export const generateSummary = async (data) => {
  const response = await client.responses.create({
    model: "gpt-5.1",
    input: `
    1. Please analyze the content of these 3 websites HTML: ${data} and identify potential headlines/articles. Mentally categorize each as Low_Impact, MID_IMPACT, HIGH_IMPACT, or MustRead. (do not output this categorization to me).

    2. Using the **MustRead** headlines (limit 5) generate a **STRICT Markdown table** using the following **EXACT** column headers: **Priority, Headline, Summary, Category, Source / Author, Why It Matters, Time Horizon, and Link**.

      **STRICT Formatting Guidelines:**
      1.  **Table Structure:** The output must be a single, correctly formatted Markdown table with headers separated by pipes (|) and a separator line (---).
      2.  **Column Headers:** Use the 8 exact column headers listed above.
      3.  **Link Column:** The final column, **Link**, must contain only the raw, complete URL (starting with http:// or https://) for the article.
      4.  **Priority:** Assign a number (1-5), where 1 is the most strategically vital and urgent story.
      5.  **Summary:** Provide a concise, analytical summary focused on strategic tension or implications (not a simple recap).
      6.  **Category:** Use specific, comma-separated tags (e.g., 'AI, Cybersecurity, Policy').
      7.  **Time Horizon:** Estimate the predicted impact timeframe (e.g., '3 to 10 years').
    `,
  });
  return response.output_text;
}