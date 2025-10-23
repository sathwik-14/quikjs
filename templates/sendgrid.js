export default () => `const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;

// Initialize SendGrid
sgMail.setApiKey(apiKey);

// Send email
const sendEmail = async (emailData) => {
  try {
    const response = await sgMail.send(emailData);
    return response;
  } catch (error) {
    console.error('SendGrid email error:', error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
};`;