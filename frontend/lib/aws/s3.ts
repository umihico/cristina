import AWS from "aws-sdk";
export const s3 = new AWS.S3({
  apiVersion: "2010-12-01",
  signatureVersion: "v4",
  region: process.env.REGION,
});

export const s3BucketName =
  process.env.BUCKET_NAME || "cristina-dev-ImageBucket";
