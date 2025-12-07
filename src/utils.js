/**
 * Calculates a person's current age based on their date of birth.
 * @param {string | Date} birthday - The date of birth (e.g., "1990-05-15" or a Date object).
 * @returns {number} The calculated age in years.
 */
export const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

/**
 * Parses a string containing a question and an answer separated by '---'.
 * @param {string} briefingText - The combined Question and Answer text.
 * @returns {{question: string, answer: string}} An object containing the cleaned question and answer.
 */
export const parseDailyBriefing = (briefingText) => {
    const parts = briefingText.split('---');

    if (parts.length < 2) {
        console.error("Error: Delimiter '---' not found or text is malformed.");
        return { question: '', answer: briefingText.trim() };
    }

    let question = parts[0].replace(/^Question:\s*/i, '').trim();
    let answer = parts[1].replace(/^Answer:\s*/i, '').trim();

    return {
        question: question,
        answer: answer
    };
};