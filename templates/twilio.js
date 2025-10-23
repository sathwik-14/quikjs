export default () => `const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize Twilio client
const twilioClient = twilio(accountSid, authToken);

// Send SMS message
const sendSmsMessage = async (messageBody, fromNumber, toNumber) => {
  try {
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber,
    });
    
    console.log(\`Twilio message sent successfully. SID: \${message.sid}\`);
    return message.sid;
  } catch (error) {
    console.error('Twilio message error:', error.message);
    throw error;
  }
};

module.exports = {
  sendSmsMessage,
};`;