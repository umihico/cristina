import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";
import { s3, s3BucketName } from "../../lib/aws/s3";

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
      Bucket: s3BucketName,
      Key: s3_path,
    })
    .promise();

  const params = {
    TableName: dynamoDbTableName,
    Item: {
      s3_path,
      owner_name: "John Doe",
      ip: "111.111.111.111",
    },
  };
  await dynamoDb.put(params).promise();
  return res.status(204).send(null);
}
