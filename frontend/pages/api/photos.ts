import { Key } from "aws-sdk/clients/dynamodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { dynamoDb, dynamoDbTableName } from "../../lib/aws/dynamodb";
import { fetchRetry } from "../../lib/retry";

export const limitPerPage = 30;

export type Photo = {
  src: string;
  width: number;
  height: number;
  displayOrder: number;
};

const toParams = (exclusiveStartKey: Key | undefined) => {
  return {
    TableName: dynamoDbTableName,
    Limit: limitPerPage,
    ExclusiveStartKey: exclusiveStartKey,
    ScanIndexForward: false,
  };
};

type Props = {
  exclusiveStartKey?: Key;
};

export const fetchPhotos = async ({
  exclusiveStartKey,
}: Props): Promise<{
  photos: Photo[];
}> => {
  const params = toParams(exclusiveStartKey);
  const response = await dynamoDb().scan(params).promise();
  const photos = [
    ...(response.Items || []).map((item) => ({
      src: `https://${process.env.IMAGE_DOMAIN}/${item.path}`,
      width: item.width || 300,
      height: item.height || 300,
      displayOrder: item.displayOrder,
    })),
  ];
  return { photos };
};

export type PhotosResponseData = {
  photos: Photo[];
};

const displayOrderQuery = "display_order";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PhotosResponseData>
) {
  const { photos } = await fetchPhotos({
    exclusiveStartKey: req.query[displayOrderQuery]
      ? ({
          displayOrder: parseInt(req.query[displayOrderQuery] as string),
          photoType: "anonymous",
        } as Key)
      : undefined,
  });
  res.status(200).send({ photos });
}

export const fetchPhotosByApi = async (
  displayOrder: number
): Promise<PhotosResponseData> => {
  return await fetchRetry(
    `/api/photos?${displayOrder ? `${displayOrderQuery}=${displayOrder}` : ""}`,
    {},
    5
  ).then((x) => x.json());
};
