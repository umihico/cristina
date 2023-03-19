import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";

export type SignatureResponseData = {
  Items: {
    s3_path: string;
    owner_name: string;
    ip: string;
  }[];
  Count: number;
  ScannedCount: number;
};

export const fetchImages = async (): Promise<{}> =>
  fetch(`/api/images`, {
    method: "GET",
  }).then((x) => x.json());

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignatureResponseData>
) {
  const params = {
    TableName: dynamoDbTableName,
  };

  const result = await dynamoDb.scan(params).promise();
  return res.status(200).send({
    Items: result.Items,
    Count: result.Count,
    ScannedCount: result.ScannedCount,
  } as SignatureResponseData);
}
