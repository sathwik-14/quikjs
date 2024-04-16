export default (input) => `
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const apiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(apiKey);

// Send email using SendGrid
const sendEmail = async (emailData) => {
  try {
    const response = await sgMail.send(emailData);
    return response;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  sendEmail
};

`