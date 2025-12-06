import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

// 💡 NOTE: Replace these with your actual email credentials or environment variables

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'smtp' for custom servers
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

export async function sendEmail(to, from, subject, textContent, htmlContent) {

  const mailOptions = {
    from: `Murphunt Dev Tools <${from}>`,
    to: to,
    // You should dynamically update the subject line here
    subject: `${subject} - ${new Date().toLocaleDateString()}`, 
    text: textContent, // Keep the plain text as a fallback
    html: htmlContent, // <-- USE THE GENERATED HTML
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('✅ Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a087a41@example.com>
  } catch (error) {
      console.error('❌ Error sending email:', error);
  }
}