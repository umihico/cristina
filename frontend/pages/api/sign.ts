import AWS from "aws-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

export type SignatureResponseData = {
  signedUrl: string;
};

// const dynamoDb = new AWS.DynamoDB.DocumentClient({
//   region: process.env.REGION,
// });

const s3 = new AWS.S3({
  apiVersion: "2010-12-01",
  signatureVersion: "v4",
  region: process.env.REGION,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignatureResponseData>
) {
  // const getParams = {
  //   // Get the table name from the environment variable
  //   TableName: process.env.TABLE_NAME,
  //   // Get the row where the counter is called "hits"
  //   Key: {
  //     counter: "hits",
  //   },
  // };
  // const results = await dynamoDb.get(getParams).promise();
  const s3Params = {
    Bucket: process.env.BUCKET_NAME || "cristina-umihico-ImageBucket",
    Key: `images/${new Date().valueOf()}.${req.query.fileExtension}`,
    Expires: 60,
    ContentType: req.query.contentType,
  };

  // get signed url to put
  const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

  // // If there is a row, then get the value of the
  // // column called "tally"
  // let count = results.Item ? results.Item.tally : 0;

  // const putParams = {
  //   TableName: process.env.TABLE_NAME,
  //   Key: {
  //     counter: "hits",
  //   },
  //   // Update the "tally" column
  //   UpdateExpression: "SET tally = :count",
  //   ExpressionAttributeValues: {
  //     // Increase the count
  //     ":count": ++count,
  //   },
  // };

  // await dynamoDb.update(putParams).promise();

  res.status(200).send({
    signedUrl,
  });
}
