import { buildWeatherForcast } from './src/weather.js';
import { generateDailyKnowledgeTester, generateSummary } from './src/openai.js';
import { pullNewsData } from './src/news.js';
import { sendEmail } from './src/email.js';
import { buildEmailHtml } from './src/formatters.js';
import { parseDailyBriefing } from './src/utils.js';

const weatherSummary = await buildWeatherForcast('Mission%20Viejo');
const newsData = await pullNewsData();
const newsSummary = await generateSummary(newsData);
const dailyQuestion = await generateDailyKnowledgeTester();
const { answer, question } = parseDailyBriefing(dailyQuestion);

const emailHtmlContent = buildEmailHtml(question, answer, newsSummary, weatherSummary)
const textContent = `Your daily brief is attached. News Summary:\n${newsSummary}\n\nWeather:\n${weatherSummary}`;

sendEmail('36murph36@gmail.com', 'murphunt.developer@gmail.com', 'Morning Briefing', textContent, emailHtmlContent);