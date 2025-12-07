import { jest } from '@jest/globals';
// Mocking the entire 'nodemailer' module to prevent real emails from being sent
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({
    sendMail: mockSendMail,
}));

jest.mock('nodemailer', () => ({
    createTransport: mockCreateTransport,
}));

// Mocking the 'dotenv' config function to avoid dependency on actual .env file during test
jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

// Set mock environment variables for the test
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'testpassword';

// Import the function to be tested AFTER mocks are set up
import { sendEmail } from '../src/email.js';

const MOCK_DATE = new Date('2024-05-15T10:00:00Z');
const MOCK_DATE_STRING = '5/15/2024';

describe('sendEmail', () => {

    const RealDate = Date;
    
    // Before each test, reset the mock function calls
    beforeEach(() => {
      jest.clearAllMocks();
      const MockDate = jest.fn(() => MOCK_DATE);
      MockDate.now = jest.fn(() => MOCK_DATE.getTime()); 
      global.Date = MockDate;
    });

    // Restore the original Date object after all tests
    afterAll(() => {
        global.Date = RealDate;
    });

    // Test Case 1: Successful email sending
    test('should call sendMail with correct mailOptions and log success', async () => {
        
        // Arrange
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        mockSendMail.mockResolvedValue({ messageId: 'test-message-id-123' });

        const to = 'recipient@test.com';
        const from = 'sender@test.com';
        const subject = 'Daily Briefing';
        const textContent = 'Plain text content.';
        const htmlContent = '<h1>HTML Content</h1>';

        // Act
        await sendEmail(to, from, subject, textContent, htmlContent);

        // Assert
        // 1. Check if the sendMail mock was called once
        expect(mockSendMail).toHaveBeenCalledTimes(1);

        // 2. Check the mailOptions passed to sendMail
        const expectedMailOptions = {
            from: `Murphunt Dev Tools <${from}>`,
            to: to,
            subject: `${subject} - ${MOCK_DATE_STRING}`, 
            text: textContent,
            html: htmlContent,
        };
        expect(mockSendMail).toHaveBeenCalledWith(expectedMailOptions);
        
        // 3. Check if success was logged
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '✅ Message sent: %s',
            'test-message-id-123'
        );

        consoleLogSpy.mockRestore();
    }, 10000);

    // Test Case 2: Error handling during email sending
    test('should catch and log an error if sendMail fails', async () => {
        
        // Arrange
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const mockError = new Error('SMTP connection failed');
        mockSendMail.mockRejectedValue(mockError);

        // Act
        await sendEmail('test@fail.com', 'test@from.com', 'Fail', 'text', 'html');

        // Assert
        // 1. Check if sendMail was still attempted
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        
        // 2. Check if the error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '❌ Error sending email:',
            mockError
        );

        consoleErrorSpy.mockRestore();
    }, 10000);
    
    // Test Case 3: Transporter setup (Implicitly tested but good to verify)
    test('should ensure nodemailer.createTransport is configured with environment variables', () => {
        // Assert that the mock transporter was created with the mocked process.env values
        expect(mockCreateTransport).toHaveBeenCalledWith({
            service: 'gmail',
            auth: {
                user: 'test@example.com',
                pass: 'testpassword',
            }
        });
    }, 10000);
});