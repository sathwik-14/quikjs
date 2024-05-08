export default () => `
const twilio = require('twilio');

async function sendMessage(body, from, to) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body,
      from,
      to
    });

    console.log("Message SID:", message.sid);
    
    return message.sid; // Return the message SID (optional)
  } catch (error) {
    // Handle errors
    console.log("Error sending Twilio message:", error);
  }
}

module.exports = sendMessage;
`;
