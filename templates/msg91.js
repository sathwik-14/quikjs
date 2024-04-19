export default (input) => `
const msg91 = require('msg91');

const authKey = process.env.MSG_AUTH_KEY;
msg91.initialize({authKey});

// Get SMS object from msg91
const getSMS = () => {
  return msg91.getSMS();
};

// Send SMS using msg91
const sendSMS = (flowId, mobileNumber, variables) => {
  const sms = getSMS();
  return sms.send(flowId, { mobile: mobileNumber, ...variables });
};

// Get OTP object from msg91
const getOTP = (otpTemplateId, options) => {
  return msg91.getOTP(otpTemplateId, options);
};

// Send OTP using msg91
const sendOTP = (otpInstance, mobileNumber) => {
  return otpInstance.send(mobileNumber);
};

// Retry OTP using msg91
const retryOTP = (otpInstance, mobileNumber) => {
  return otpInstance.retry(mobileNumber);
};

// Verify OTP using msg91
const verifyOTP = (otpInstance, mobileNumber, otp) => {
  return otpInstance.verify(mobileNumber, otp);
};

// Get Campaign object from msg91
const getCampaign = () => {
  return msg91.getCampaign();
};

// Get all campaigns using msg91
const getAllCampaigns = (campaignInstance) => {
  return campaignInstance.getAll();
};

// Run a campaign using msg91
const runCampaign = (campaignInstance, slug, data) => {
  return campaignInstance.run(slug, { data });
};

module.exports = {
  initializeMsg91,
  sendSMS,
  getOTP,
  sendOTP,
  retryOTP,
  verifyOTP,
  getCampaign,
  getAllCampaigns,
  runCampaign
};


`