import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";
import { s3, s3BucketName } from "../../lib/aws/s3";

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
  fetch("/api/dynamo", {
    method: "POST",
    body: JSON.stringify({ path, width, height }),
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log({ body: req.body });
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
      s3_path: path,
      width,
      height,
      owner_name: "John Doe",
      ip: "111.111.111.111",
    },
  };
  await dynamoDb.put(params).promise();
  return res.status(204).send(null);
}
