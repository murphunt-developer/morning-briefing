import { markdownTableToHtml, buildEmailHtml } from '../src/formatters.js';

const thStyle = "border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; background-color: #f0f8ff; color: #004d99;";
const tdStyle = "border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top;";
const linkStyle = "color: #007bff; text-decoration: none; font-weight: bold;";

describe('markdownTableToHtml', () => {

    test('should convert a standard markdown table to HTML correctly', () => {
        const markdown = `
| Header 1 | Header 2 |
|---|---|
| Cell 1A | Cell 2A |
| Cell 1B | Cell 2B |
        `;
        
        const expectedHtml = `
<table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><thead><tr><th style="${thStyle}">Header 1</th><th style="${thStyle}">Header 2</th></tr></thead><tbody><tr><td style="${tdStyle}">Cell 1A</td><td style="${tdStyle}">Cell 2A</td></tr><tr><td style="${tdStyle}">Cell 1B</td><td style="${tdStyle}">Cell 2B</td></tr></tbody></table>
        `.trim().replace(/\s+/g, ' ');

        const result = markdownTableToHtml(markdown).trim().replace(/\s+/g, ' ');

        expect(result).toBe(expectedHtml);
    });

    test('should convert markdown links inside cells to styled HTML anchor tags', () => {
        const markdown = `
| Headline | Source |
|---|---|
| [Big News Title](https://example.com/news) | Tech Blog |
| Another Item | [Internal Link](https://internal.com) |
        `;

        const linkHtml1 = `<a href="https://example.com/news" target="_blank" style="${linkStyle}">Big News Title</a>`;
        const linkHtml2 = `<a href="https://internal.com" target="_blank" style="${linkStyle}">Internal Link</a>`;

        const expectedHtml = `
<table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><thead><tr><th style="${thStyle}">Headline</th><th style="${thStyle}">Source</th></tr></thead><tbody><tr><td style="${tdStyle}">${linkHtml1}</td><td style="${tdStyle}">Tech Blog</td></tr><tr><td style="${tdStyle}">Another Item</td><td style="${tdStyle}">${linkHtml2}</td></tr></tbody></table>
        `.trim().replace(/\s+/g, ' ');

        const result = markdownTableToHtml(markdown).trim().replace(/\s+/g, ' ');

        expect(result).toBe(expectedHtml);
    });
    
    test('should correctly convert multiple markdown links within a single cell', () => {
        const markdown = `
| Links |
|---|
| [Link 1](http://a.com), [Link 2](http://b.com) and some text. |
        `;

        const linkHtml1 = `<a href="http://a.com" target="_blank" style="${linkStyle}">Link 1</a>`;
        const linkHtml2 = `<a href="http://b.com" target="_blank" style="${linkStyle}">Link 2</a>`;
        const expectedCellContent = `${linkHtml1}, ${linkHtml2} and some text.`;

        const expectedHtml = `
<table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><thead><tr><th style="${thStyle}">Links</th></tr></thead><tbody><tr><td style="${tdStyle}">${expectedCellContent}</td></tr></tbody></table>
        `.trim().replace(/\s+/g, ' ');

        const result = markdownTableToHtml(markdown).trim().replace(/\s+/g, ' ');

        expect(result).toBe(expectedHtml);
    });

    test('should return an error message for insufficient markdown lines', () => {
        const shortMarkdown = "| H1 | H2 |";
        const emptyMarkdown = "";
        const expectedError = '<p style="color: red;">Error: Could not parse news table data.</p>';

        expect(markdownTableToHtml(shortMarkdown)).toBe(expectedError);
        expect(markdownTableToHtml(emptyMarkdown)).toBe(expectedError);
    });
    
    test('should handle empty cells and inconsistent line spacing', () => {
        const markdown = `
| H1 | H2 | H3 |
|---|---|---|
| A | | C |
|   | B |   |
        
        `;
        
        const expectedHtml = `
<table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><thead><tr><th style="${thStyle}">H1</th><th style="${thStyle}">H2</th><th style="${thStyle}">H3</th></tr></thead><tbody><tr><td style="${tdStyle}">A</td><td style="${tdStyle}"></td><td style="${tdStyle}">C</td></tr><tr><td style="${tdStyle}"></td><td style="${tdStyle}">B</td><td style="${tdStyle}"></td></tr></tbody></table>
        `.trim().replace(/\s+/g, ' ');

        const result = markdownTableToHtml(markdown).trim().replace(/\s+/g, ' ');

        expect(result).toBe(expectedHtml);
    });
});

describe('buildEmailHtml', () => {
    
    test('should return a complete HTML email document with content injected', () => {
        const dailyQuestion = "What is the key to microservice orchestration?";
        const dailyAnswer = "Eventual consistency and reliable message queues.";
        const newsSummary = "| Col 1 |\n|---|\n| Data 1 |";
        const weatherSummaryHtml = "<div>Sunny, 75°F.</div>";
        const result = buildEmailHtml(dailyQuestion, dailyAnswer, newsSummary, weatherSummaryHtml);

        expect(result).toContain('<!DOCTYPE html>');
        expect(result).toContain('<body>');
        expect(result).toContain('<div class="container">');
        expect(result).toContain('<h1>🧠 Your Daily Morning Briefing 📰</h1>');
        expect(result).toContain(dailyQuestion);
        expect(result).toContain(dailyAnswer);
        expect(result).toContain('<div>Sunny, 75°F.</div>');
        expect(result).toContain('</tr></thead><tbody><tr><td style="border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top;">Data 1</td></tr></tbody></table>');
    });
});