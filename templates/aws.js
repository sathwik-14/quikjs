export default {
  s3: {
    config: () => `const AWS = require('aws-sdk');

const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const bucketName = process.env.S3_BUCKET_NAME;

module.exports = {
  s3Client,
  bucketName,
};`,

    utils: () => `const { s3Client, bucketName } = require('../config/aws.js');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const uploadFile = (filePath, keyName) => {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filePath);
      const uploadParams = {
        Bucket: bucketName,
        Key: keyName,
        Body: fileContent,
      };

      s3Client.upload(uploadParams, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

const putObject = (key, fileBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
      };

      s3Client.putObject(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        data.url = \`https://\${bucketName}.s3.amazonaws.com/\${key}\`;
        data.key = key;
        return resolve(data);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

const getSignedUploadUrl = (key) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = path.basename(key);
      const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 30 * 60,
        ContentType: mime.lookup(fileName) || 'application/octet-stream',
      };

      const signedUrl = s3Client.getSignedUrl('putObject', params);

      if (signedUrl) {
        return resolve(signedUrl);
      } else {
        return reject(new Error('Cannot create signed URL'));
      }
    } catch (err) {
      return reject(new Error('Cannot create signed URL'));
    }
  });
};

const getSignedDownloadUrl = (key) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = path.basename(key);
      const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 30 * 60,
      };

      const signedUrl = s3Client.getSignedUrl('getObject', params);

      if (signedUrl) {
        return resolve({
          signedUrl,
          fileName,
        });
      } else {
        return reject(new Error('Cannot create signed URL'));
      }
    } catch (err) {
      return reject(new Error('Cannot create signed URL'));
    }
  });
};

const deleteObject = (key) => {
  return new Promise((resolve, reject) => {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };

      s3Client.deleteObject(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = {
  uploadFile,
  putObject,
  getSignedUploadUrl,
  getSignedDownloadUrl,
  deleteObject,
};`,
  },

  sns: () => `const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendMessageToSnsTopic = async (message, topicArn, region = 'ap-south-1') => {
  try {
    // Set region
    AWS.config.update({ region });

    // Create SNS client
    const snsClient = new AWS.SNS();

    // Create publish parameters
    const params = {
      Message: message,
      TopicArn: topicArn,
    };

    // Publish message
    const data = await snsClient.publish(params).promise();

    // Log success message
    console.log(\`Message "\${params.Message}" sent to topic \${params.TopicArn}\`);
    console.log(\`MessageID: \${data.MessageId}\`);

    return data;
  } catch (error) {
    console.error('SNS publish error:', error.message);
    throw error;
  }
};

module.exports = {
  sendMessageToSnsTopic,
};`,
};