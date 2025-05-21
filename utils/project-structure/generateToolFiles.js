import { write } from '../index.js'; // Assuming utils/index.js exports this
import { aws, twilio, sendgrid, msg91 } from '../../templates/index.js'; // Assuming templates/index.js exports these

export const generateToolFiles = async (tools = []) => {
  const files = [];

  const toolFileDefinitions = {
    s3: [
      { path: 'config/aws.js', content: aws.s3.config() },
      { path: 'utils/s3.js', content: aws.s3.utils() },
    ],
    sns: [{ path: 'utils/sns.js', content: aws.sns() }],
    twilio: [{ path: 'utils/twilio.js', content: twilio() }],
    msg91: [{ path: 'utils/msg91.js', content: msg91() }],
    sendgrid: [{ path: 'utils/sendgrid.js', content: sendgrid() }],
  };

  for (const tool of tools) {
    if (toolFileDefinitions[tool]) {
      files.push(...toolFileDefinitions[tool]);
    }
  }

  for (const file of files) {
    await write(file.path, file.content); // Assuming default formatting is fine
  }
};
