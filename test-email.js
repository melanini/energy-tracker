require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

async function main() {
  try {
    // First, verify the connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Then try to send a test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_SERVER_USER, // Send to yourself
      subject: 'Test Email from Ryze',
      text: 'If you receive this, your email configuration is working!',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication failed. Common causes:');
      console.error('1. Incorrect email or password');
      console.error('2. App Password not used (required for Gmail)');
      console.error('3. 2FA not enabled on Gmail account');
    }
  }
}

main().catch(console.error);
