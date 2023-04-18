import { Key } from "aws-sdk/clients/dynamodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";
import { s3Host } from "../../lib/aws/s3";

export type Photo = {
  src: string;
  width: number;
  height: number;
};

const toParams = (exclusiveStartKey: Key | undefined) => {
  return {
    TableName: dynamoDbTableName,
    Limit: 30,
    ExclusiveStartKey: exclusiveStartKey,
  };
};

type Props = {
  exclusiveStartKey?: Key;
};

export const fetchPhotos = async ({
  exclusiveStartKey,
}: Props): Promise<{
  photos: Photo[];
  path: string | null;
}> => {
  const params = toParams(exclusiveStartKey);
  const response = await dynamoDb().scan(params).promise();
  const photos = [
    ...(response.Items || []).map((item) => ({
      src: `https://${s3Host}/${item.s3_path}`,
      width: item.width || 300,
      height: item.height || 300,
    })),
    // ...unsplashPhotos,
  ];
  const path = (response.LastEvaluatedKey?.s3_path as string) || null;
  return { photos, path };
};

export type PhotosResponseData = {
  photos: Photo[];
  path: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PhotosResponseData>
) {
  const { photos, path } = await fetchPhotos({
    exclusiveStartKey: { s3_path: req.query.path } as Key | undefined,
  });
  res.status(200).send({ photos, path });
}

export const fetchPhotosByApi = async (
  path: string
): Promise<PhotosResponseData> => {
  return await fetch(`/api/photos?path=${path}`).then((x) => x.json());
};
