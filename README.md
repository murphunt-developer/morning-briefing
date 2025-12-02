# 🚀 Morning Briefing: The 5.5 Hour Speedrun

**Goal:** Go from zero to a working AI email assistant in one evening.

## 🕒 Hour 0.0 - 0.5: Setup & Credentials
*Target: Basic connectivity*

1.  **Initialize:** Create folders and run `npm install`.
2.  **OpenAI:** Log in to [OpenAI Platform](https://platform.openai.com/), generate an API Key.
3.  **OpenWeather:** Sign up for [OpenWeatherMap](https://openweathermap.org/) (Free), get API Key.
4.  **Gmail:** Go to Google Account > Security > 2-Step Verification > **App Passwords**. Generate one for "Mail".
5.  **Environment:** Create `.env` file:
    ```env
    OPENAI_API_KEY=sk-...
    WEATHER_API_KEY=...
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    GOOGLE_CALENDAR_ID=primary
    ```

## 🕒 Hour 0.5 - 1.5: The Data Fetchers (Easy Wins)
*Target: `weather.js` and `news.js` are working.*

### Weather (`src/weather.js`)
* **Task:** Use `axios` to hit `https://api.openweathermap.org/data/2.5/weather?q=YOUR_CITY&appid=KEY&units=imperial`.
* **Output:** Return a string: "Current temp is 65F with clear skies."

### News (`src/news.js`)
* **Task:** Use `rss-parser`.
* **Source:** TechCrunch (`https://techcrunch.com/feed/`) or BBC Top Stories.
* **Output:** Return an array of the top 3 headlines.

## 🕒 Hour 1.5 - 3.0: The Boss Level (Google Calendar)
*Target: Successfully authenticated with Google.*

* **Warning:** This is the hardest part. If you get stuck for >45 mins, skip this and hardcode a fake schedule to finish the rest of the project.
1.  **GCP Console:** Go to Google Cloud Console. Create New Project.
2.  **Enable API:** Search for "Google Calendar API" and enable it.
3.  **Credentials:** Create "Service Account" credentials. Download the JSON key file. save as `service-account.json`.
4.  **Share:** Go to your actual Google Calendar UI > Settings > Share with specific people > Add the `client_email` from your JSON file.
5.  **Code (`src/calendar.js`):** Use `googleapis` JWT auth to list the next 10 events.

## 🕒 Hour 3.0 - 4.0: The Brain (OpenAI Integration)
*Target: A witty text response generated from raw data.*

### Agent (`src/agent.js`)
* **Task:** Import `openai`.
* **Prompt Engineering:**
    > "You are a sarcastic personal assistant. Here is the data for today:
    > Weather: ${weatherString}
    > News: ${newsString}
    > Calendar: ${calendarString}
    >
    > Write a 2-paragraph briefing. Warn me if I'm busy. Make a joke about the news."
* **Test:** console.log the response.

## 🕒 Hour 4.0 - 5.0: The Courier (Email & Orchestration)
*Target: Receiving the email.*

1.  **Main (`index.js`):**
    * Import all modules.
    * `await` all data fetchers.
    * Pass data to `agent.js`.
    * Pass AI response to `nodemailer`.
2.  **Email:** Use `nodemailer` with service `gmail`.
    ```javascript
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Morning Briefing",
      text: aiResponse
    });
    ```

## 🕒 Hour 5.0 - 5.5: Final Polish
* Add `node-cron` in `index.js` to run the function at `0 7 * * *` (7:00 AM).
* Run the script manually once to celebrate.
* **Sleep.**