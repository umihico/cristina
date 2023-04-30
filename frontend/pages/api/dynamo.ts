import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";
import { s3, s3BucketName } from "../../lib/aws/s3";
import { fetchRetry } from "../../lib/retry";

type Props = {
  path: string;
  width: number;
  height: number;
};

export const requestInsertion = async ({
  path,
  width,
  height,
}: Props): Promise<{}> =>
  fetchRetry(
    "/api/dynamo",
    {
      method: "POST",
      body: JSON.stringify({ path, width, height }),
    },
    5
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path, width, height } = JSON.parse(req.body) as Props;
  await s3
    .getObject({
      Bucket: s3BucketName,
      Key: path,
    })
    .promise();

  const params = {
    TableName: dynamoDbTableName,
    Item: {
      path: path,
      width,
      height,
      photoType: "anonymous",
      displayOrder: 2000000000000 - new Date().valueOf(),
    },
  };
  await dynamoDb().put(params).promise();
  return res.status(204).send(null);
}
