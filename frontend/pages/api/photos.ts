import { Key } from "aws-sdk/clients/dynamodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";

export type Photo = {
  src: string;
  width: number;
  height: number;
};

const toParams = (exclusiveStartKey: Key | undefined) => {
  return {
    TableName: dynamoDbTableName,
    Limit: 20, // lambdaの同時実行数は10なので、2回のフェッチで全件表示させる
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
      src: `https://${process.env.IMAGE_DOMAIN}/${item.s3_path}`,
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
    exclusiveStartKey: req.query.path
      ? ({ s3_path: req.query.path } as Key)
      : undefined,
  });
  res.status(200).send({ photos, path });
}

export const fetchPhotosByApi = async (
  path: string | null
): Promise<PhotosResponseData> => {
  return await fetch(`/api/photos?${path ? `path=${path}` : ""}`).then((x) =>
    x.json()
  );
};
