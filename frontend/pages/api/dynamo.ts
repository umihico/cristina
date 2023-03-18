import AWS from "aws-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { s3 } from "./sign";

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION,
});

export const requestInsertion = async (path: string): Promise<{}> =>
  fetch(`/api/dynamo?path=${path}`, {
    method: "POST",
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const s3_path = req.query.path as string;
  await s3
    .getObject({
      Bucket: process.env.BUCKET_NAME || "cristina-umihico-ImageBucket",
      Key: s3_path,
    })
    .promise();

  const params = {
    TableName: process.env.TABLE_NAME || "cristina-umihico-Record",
    Item: {
      s3_path,
      owner_name: "John Doe",
      ip: "111.111.111.111",
    },
  };
  await dynamoDb.put(params).promise();
  return res.status(204).send(null);
}
