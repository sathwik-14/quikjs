export default () => `const msg91 = require('msg91');

const authKey = process.env.MSG91_AUTH_KEY;

// Initialize MSG91
msg91.initialize({ authKey });

// Get SMS client
const getSmsClient = () => {
  return msg91.getSMS();
};

// Send SMS
const sendSms = (flowId, mobileNumber, variables) => {
  const smsClient = getSmsClient();
  return smsClient.send(flowId, { mobile: mobileNumber, ...variables });
};

// Get OTP client
const getOtpClient = (templateId, options = {}) => {
  return msg91.getOTP(templateId, options);
};

// Send OTP
const sendOtp = (otpClient, mobileNumber) => {
  return otpClient.send(mobileNumber);
};

// Retry OTP
const retryOtp = (otpClient, mobileNumber) => {
  return otpClient.retry(mobileNumber);
};

// Verify OTP
const verifyOtp = (otpClient, mobileNumber, otp) => {
  return otpClient.verify(mobileNumber, otp);
};

// Get Campaign client
const getCampaignClient = () => {
  return msg91.getCampaign();
};

// Get all campaigns
const getAllCampaigns = (campaignClient) => {
  return campaignClient.getAll();
};

// Run a campaign
const runCampaign = (campaignClient, slug, data) => {
  return campaignClient.run(slug, { data });
};

module.exports = {
  getSmsClient,
  sendSms,
  getOtpClient,
  sendOtp,
  retryOtp,
  verifyOtp,
  getCampaignClient,
  getAllCampaigns,
  runCampaign,
};`;