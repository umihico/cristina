import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";
import { s3Host } from "../../lib/aws/s3";
import { unsplashPhotos } from "../../lib/image";

export type Photo = {
  src: string;
  width: number;
  height: number;
};

const params = {
  TableName: dynamoDbTableName,
};

export const fetchPhotos = async (): Promise<Photo[]> => {
  const response = await dynamoDb.scan(params).promise();
  const photos = [
    ...(response.Items || []).map((item) => ({
      src: `https://${s3Host}/${item.s3_path}`,
      width: item.width || 300,
      height: item.height || 300,
    })),
    ...unsplashPhotos,
  ];
  return photos;
};

export type PhotosResponseData = {
  photos: Photo[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PhotosResponseData>
) {
  const photos = await fetchPhotos();
  res.status(200).send({ photos });
}

export const fetchPhotosByApi = async (): Promise<PhotosResponseData> => {
  return await fetch("/api/photos").then((x) => x.json());
};
