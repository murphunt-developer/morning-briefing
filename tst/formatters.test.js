import { markdownTableToHtml, buildEmailHtml } from '../src/formatters';

// --- Test Data for markdownTableToHtml ---

const validMarkdownInput = `
| Priority | Headline | Category | Status | Team | Creator | Timestamp | Link URL |
|---|---|---|---|---|---|---|---|
| P1 | Critical Bug Found | Dev | Open | Unicorns | Alice | 2025-12-05T10:00:00Z | https://jira.example.com/bug-101 |
| P2 | Feature XYZ Released | Product | Closed | Phoenix | Bob | 2025-12-05T12:30:00Z | https://wiki.example.com/feature-xyz |
| P3 | Minor Typo Fix | Documentation | Merged | Falcons | Charlie | 2025-12-05T14:45:00Z | N/A |
| P4 | Short Row | Misc | Test | Self | X | 2025-12-05T14:45:00Z | http://example.com/short |
`;

const validExpectedHtml = `<table><thead><tr><th>Priority</th><th>Headline</th><th>Category</th><th>Status</th><th>Team</th><th>Creator</th><th>Timestamp</th><th>Link URL</th></tr></thead><tbody><tr><td>P1</td><td><a href="https://jira.example.com/bug-101" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">Critical Bug Found</a></td><td>Dev</td><td>Open</td><td>Unicorns</td><td>Alice</td><td>2025-12-05T10:00:00Z</td><td>https://jira.example.com/bug-101</td></tr><tr><td>P2</td><td><a href="https://wiki.example.com/feature-xyz" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">Feature XYZ Released</a></td><td>Product</td><td>Closed</td><td>Phoenix</td><td>Bob</td><td>2025-12-05T12:30:00Z</td><td>https://wiki.example.com/feature-xyz</td></tr><tr><td>P3</td><td>Minor Typo Fix</td><td>Documentation</td><td>Merged</td><td>Falcons</td><td>Charlie</td><td>2025-12-05T14:45:00Z</td><td>N/A</td></tr><tr><td>P4</td><td><a href="http://example.com/short" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">Short Row</a></td><td>Misc</td><td>Test</td><td>Self</td><td>X</td><td>2025-12-05T14:45:00Z</td><td>http://example.com/short</td></tr></tbody></table>`;

const emptyBodyMarkdown = `
| H1 | H2 | H3 |
|---|---|---|
| | | |
`; // Should still produce a table with just a header and one empty row

// --- Test Data for buildEmailHtml ---

const mockNewsMarkdown = `
| Priority | Headline | Category | Status | Team | Creator | Timestamp | Link URL |
|---|---|---|---|---|---|---|---|
| P1 | Amazing New Tech | Dev | Open | TeamX | Alice | 2025-12-06T00:00:00Z | https://tech.example.com/new |
`;

const mockNewsHtmlSnippet = '<table><thead><tr><th>Priority</th><th>Headline</th><th>Category</th><th>Status</th><th>Team</th><th>Creator</th><th>Timestamp</th><th>Link URL</th></tr></thead><tbody><tr><td>P1</td><td><a href="https://tech.example.com/new" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">Amazing New Tech</a></td><td>Dev</td><td>Open</td><td>TeamX</td><td>Alice</td><td>2025-12-06T00:00:00Z</td><td>https://tech.example.com/new</td></tr></tbody></table>';

const mockWeatherHtml = '<span>The sky is blue and the temperature is 75°F.</span>';


// ##################################################################

describe('markdownTableToHtml', () => {
    
    // --- Success Cases ---
    
    it('should correctly convert a full markdown table to HTML with proper header and rows', () => {
        expect(markdownTableToHtml(validMarkdownInput)).toBe(validExpectedHtml);
    });

    it('should correctly link the headline column (index 1) when the link column (index 7) starts with "http"', () => {
        // We test this by asserting the first headline cell contains the <a> tag
        const result = markdownTableToHtml(validMarkdownInput);
        expect(result).toContain('<a href="https://jira.example.com/bug-101"');
    });

    it('should NOT link the headline column when the link column (index 7) does NOT start with "http"', () => {
        // We test this by asserting the third headline cell does NOT contain the <a> tag
        const result = markdownTableToHtml(validMarkdownInput);
        expect(result).not.toContain('>Minor Typo Fix</a>');
        expect(result).toContain('<td>Minor Typo Fix</td>');
    });
    
    it('should handle markdown with no data rows (only header and separator)', () => {
        const noDataMarkdown = '| H1 | H2 | H3 |\n|---|---|---|';
        // Your function expects at least 3 lines: Header, Separator, and Data.
        // Since there is no data row, lines.length will be 2.
        expect(markdownTableToHtml(noDataMarkdown)).toBe('<p style="color: red;">Error: Could not parse news table data.</p>');
    });

    it('should handle empty cells and lines gracefully', () => {
        const result = markdownTableToHtml(emptyBodyMarkdown);
        expect(result).toContain('<thead><tr><th>H1</th><th>H2</th><th>H3</th></tr></thead>');
        // It should contain an empty data row, as a row of pipes is a valid line
        expect(result).toContain('<tbody><tr><td></td><td></td><td></td></tr></tbody>');
    });
    
    // --- Error Cases ---

    it('should return an error message for input with fewer than 3 effective lines (Header + Separator only)', () => {
        const shortInput = '| H1 | H2 |\n|---|---|'; 
        expect(markdownTableToHtml(shortInput)).toBe('<p style="color: red;">Error: Could not parse news table data.</p>');
    });

    it('should return an error message for completely empty input', () => {
        const emptyInput = ' '; 
        expect(markdownTableToHtml(emptyInput)).toBe('<p style="color: red;">Error: Could not parse news table data.</p>');
    });
});

describe('buildEmailHtml', () => {
    
    it('should combine news HTML and weather HTML into the correct email structure', () => {
        
        const result = buildEmailHtml(mockNewsMarkdown, mockWeatherHtml);

        // 1. Check for core HTML structure tags
        expect(result).toContain('<!DOCTYPE html>');
        expect(result).toContain('<h1>🌤️ Your Daily Morning Briefing 📰</h1>');
        
        // 2. Check for the weather content integration
        expect(result).toContain('<h2>Today\'s Weather Forecast</h2>');
        expect(result).toContain(mockWeatherHtml); // Should include the mock span tag
        
        // 3. Check for the news content integration
        expect(result).toContain('<h2>Top 5 Strategic Tech Headlines</h2>');
        // This is the most crucial part: ensure markdownTableToHtml was called and embedded.
        expect(result).toContain(mockNewsHtmlSnippet); 
        
        // 4. Check for the closing paragraph
        expect(result).toContain('Briefing generated by your Node.js script and OpenAI.');
    });

    it('should handle empty news markdown by embedding the error message into the body', () => {
        const result = buildEmailHtml(' ', mockWeatherHtml);
        
        // The embedded newsHtml should be the error message from markdownTableToHtml
        expect(result).toContain('<p style="color: red;">Error: Could not parse news table data.</p>');
        expect(result).toContain(mockWeatherHtml);
    });
});