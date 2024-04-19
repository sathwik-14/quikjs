
export default {
  s3: {
    config: (input) => `
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    
    const BUCKET = process.env.S3_BUCKET_NAME;

module.exports = {
    s3,
    BUCKET
}
    `,
    utils: (input) => `
    const {s3,BUCKET} = require("../config/aws.js");
    const path = require('path');

    const uploadFile = (filePath, keyName) => {
  
        return new Promise((resolve, reject) => {
        try {
        var fs = require('fs');
        const file = fs.readFileSync(filePath);        
        const uploadParams = {
        Bucket: BUCKET,
        Key: keyName,
        Body: file
        };
        
        s3.upload(uploadParams, function (err, data) {
        if (err) {
        return reject(err);
        }
        if (data) {
        return resolve(data);
        }
        });
        } catch (err) {
        return reject(err);
        }
        })
        }

        const putObject = (key, fileBuffer) => {
            return new Promise((resolve, reject) => {
            try {
                        
            const params = {
            Bucket: BUCKET,
            Key: key,
            Body: fileBuffer
            };
            
            s3.putObject(params, function (err, data) {
            if (err)
            return reject(err);
            
            data.url =\`https://\${BUCKET}.\${dosCredentials.region}.digitaloceanspaces.com/\${key}\`

            ;
            data.key = key;
            return resolve(data);
            });
            } catch (err) {
            return reject(err);
            }
            });
            }

            const getSignUrl = (key) => {
                return new Promise((resolve, reject) => {
                try {
                const fileName = path.basename(key);
                var params = {
                Bucket : BUCKET,
                Key : key,
                Expires : 30 * 60,
                ContentType : mime.lookup(path.basename(filename)),
                };
                
                const signedUrl = s3.getSignedUrl('putObject', params);
                
                if (signedUrl) {
                return resolve(signedUrl);
                } else {
                return reject("Cannot create signed URL");
                }
                } catch (err) {
                return reject("Cannot create signed URL!");
                }
                });
                }

                const getSignUrlForFile = (key) => {
                    return new Promise((resolve, reject) => {
                    try {
                    const fileName = path.basename(key);
                    
                    var params = {
                    Bucket: BUCKET,
                    Key: key,
                    Expires: 30 * 60
                    };
                    
                    const signedUrl = s3.getSignedUrl('getObject', params);
                    
                    if (signedUrl) {
                    return resolve({
                    signedUrl,
                    fileName,
                    });
                    } else {
                    return reject("Cannot create signed URL");
                    }
                    } catch (err) {
                    return reject("Cannot create signed URL!");
                    }
                    });
                    }

                    const deleteObject = (key) => {
                        return new Promise((resolve, reject) => {
                        try {
                        var params = {
                        Bucket: BUCKET,
                        Key: key
                        };
                        
                        s3.deleteObject(params, function (err, data) {
                        if (err)
                        return reject(err);
                        return resolve(data);
                        });
                        } catch (err) {
                        return reject(err);
                        }
                        });
                        }

        module.exports = {
            uploadFile,
            putObject,
            getSignUrl,
            getSignUrlForFile,
            deleteObject
        }
    `,
  },
  sns: (input) => `
const AWS = require("aws-sdk");

const sendMessageToSnsTopic = async (message, topicArn, region = "ap-south-1") => {
    try {
      // Set region
      AWS.config.update({ region });
  
      // Create publish parameters
      const params = {
        Message: message, // required
        TopicArn: topicArn,
      };
  
      // Create promise and SNS service object
      const sns = new AWS.SNS({ apiVersion: "2010-03-31" });
      const data = await sns.publish(params).promise();
  
      // Log success message
      console.log(\`Message \${params.Message} sent to the topic \${params.TopicArn}\`);
      console.log("MessageID is " + data.MessageId);
  
      return data; // Return the result (optional)
    } catch (error) {
      // Handle errors
      console.log(error, error.stack);
    }
  }

  module.exports = {
    sendMessageToSnsTopic
  }
  `
};
