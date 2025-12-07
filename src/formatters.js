/**
 * Custom function to convert the specific Markdown Table output from OpenAI
 * into a clean HTML table structure, applying inline styles for email compatibility.
 * Now handles standard Markdown links [text](url) within cells.
 * @param {string} markdown - The markdown string containing the news table.
 * @returns {string} The HTML representation of the table.
 */
export const markdownTableToHtml = (markdown) => {
    // Regular expression to find Markdown links: [text](url)
    // Group 1: link text, Group 2: link URL
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;

    /**
     * Converts a string containing Markdown links into an HTML string with <a> tags.
     * Handles cases where the cell might contain plain text or multiple links.
     * @param {string} cellContent - The content of a single table cell.
     * @returns {string} HTML content.
     */
    const convertMarkdownLinks = (cellContent) => {
        // Replace all occurrences of [text](url) with <a href="url" target="_blank" style="...">text</a>
        return cellContent.replace(linkRegex, (match, text, url) => {
            // Inline style for links to ensure email compatibility and visual distinction
            const linkStyle = "color: #007bff; text-decoration: none; font-weight: bold;";
            return `<a href="${url}" target="_blank" style="${linkStyle}">${text}</a>`;
        });
    };

    // 1. Split the string into lines and filter out empty ones
    const lines = markdown.trim().split('\n').filter(line => line.trim().length > 0);

    if (lines.length < 3) {
        return '<p style="color: red;">Error: Could not parse news table data.</p>';
    }

    // The first line is the Header Row (e.g., | Priority | Headline |...)
    const headerLine = lines[0];
    
    // The second line is the Separator Row (e.g., |---|---|...) - we ignore this line
    
    // The remaining lines are the Data Rows
    const dataLines = lines.slice(2); 

    // Helper function to process a line into cells
    const processLineToCells = (line) => {
      // Splits by '|', removes the first and last empty elements, and trims spaces.
      return line.split('|').slice(1, -1).map(cell => cell.trim());
    };

    // Base table style applied
    let html = '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';

    // 1. Table Header (TH)
    const headers = processLineToCells(headerLine);
    // Inline styles for TH cells
    const thStyle = "border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; background-color: #f0f8ff; color: #004d99;";
    
    html += '<thead><tr>';
    headers.forEach(header => {
        html += `<th style="${thStyle}">${header}</th>`;
    });
    html += '</tr></thead>';

    // 2. Table Body (TD)
    // Inline styles for TD cells
    const tdStyle = "border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top;";
    
    html += '<tbody>';
    dataLines.forEach(dataLine => {
        const cells = processLineToCells(dataLine);
        html += '<tr>';
        cells.forEach((cell) => {
            // Run the cell content through the Markdown link converter
            const processedCellContent = convertMarkdownLinks(cell);
            
            // Add the table data cell
            html += `<td style="${tdStyle}">${processedCellContent}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';

    return html;
};

/**
 * Combines the formatted question, news, and weather into a complete email body.
 * within a white container.
 * @param {string} dailyQuestion - The question from the LLM.
 * @param {string} dailyAnswer - The answer from the LLM.
 * @param {string} newsSummary - The Markdown news table.
 * @param {string} weatherSummaryHtml - The HTML weather report.
 * @returns {string} The final, complete HTML email body.
 */
export const buildEmailHtml = (
    dailyQuestion, 
    dailyAnswer, 
    newsSummary, 
    weatherSummaryHtml
) => {
    const newsHtml = markdownTableToHtml(newsSummary);

    // Styling for the Question/Answer blocks
    const questionBoxStyle = "background-color: #fff3e0; padding: 15px 20px; border-left: 5px solid #ff9800; border-radius: 4px; margin-bottom: 25px;";
    const answerBoxStyle = "background-color: #e8f5e9; padding: 15px 20px; border-left: 5px solid #4caf50; border-radius: 4px; margin-top: 25px;";
    const questionTextStyle = "font-size: 16px; font-weight: bold; color: #d65800; margin: 0; line-height: 1.5;";
    const answerTextStyle = "font-size: 14px; color: #1b5e20; margin: 0; line-height: 1.5;";

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
            <style>
                /* General Body and Text Styles */
                /* 💡 FIX: Apply full-screen background to BODY */
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 0;
                    background-color: #f4f4f4; /* Full screen background */
                }
                
                /* CRITICAL: Container limits content width and centers it */
                .container { 
                    /* width: 100%; 
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: #ffffff;  */

                    max-width: 600px;
                    min-width: 320px;  /* Good practice for mobile support */
                    width: 90%;
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: #ffffff;
                }
                h1 { color: #004d99; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0; font-size: 24px; }
                h2 { color: #007bff; margin-top: 30px; font-size: 20px; }
                
                /* Weather Box Style */
                .weather-box { background-color: #e6f7ff; padding: 15px; border-radius: 8px; border: 1px solid #b3e0ff; }

                /* Footer Style */
                .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🧠 Your Daily Morning Briefing 📰</h1>

                <h2>💡 Daily Engineering Focus</h2>
                <div style="${questionBoxStyle}">
                    <p style="font-size: 12px; font-weight: bold; color: #ff9800; margin: 0 0 5px 0;">YOUR DAILY QUESTION</p>
                    <p style="${questionTextStyle}">${dailyQuestion}</p>
                </div>

                <h2>☀️ Today's Weather Forecast</h2>
                <div class="weather-box">
                    ${weatherSummaryHtml} 
                </div>

                <h2>📰 Top 3 Strategic Tech Headlines</h2>
                ${newsHtml}

                <div style="${answerBoxStyle}">
                    <p style="font-size: 12px; font-weight: bold; color: #4caf50; margin: 0 0 5px 0;">STRATEGIC INSIGHT</p>
                    <p style="${answerTextStyle}">${dailyAnswer}</p>
                </div>

                <p class="footer">Briefing generated by your Node.js script and OpenAI. Continue building your knowledge!</p>
            </div>
        </body>
        </html>
    `;
};