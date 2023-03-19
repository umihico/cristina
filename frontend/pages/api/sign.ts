import type { NextApiRequest, NextApiResponse } from "next";
import { s3, s3BucketName } from "../../lib/aws/s3";

type Props = {
  fileExtension: string;
  contentType: string;
  lastModified: string;
};
export const requestSignedUrl = async ({
  fileExtension,
  contentType,
  lastModified,
}: Props): Promise<SignatureResponseData> =>
  fetch(
    `/api/sign?` +
      new URLSearchParams({
        contentType,
        fileExtension,
        lastModified,
      }),
    {
      method: "POST",
    }
  ).then((x) => x.json());

export type SignatureResponseData = {
  signedUrl: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignatureResponseData>
) {
  const s3Params = {
    Bucket: s3BucketName,
    Key: `images/${req.query.lastModified || new Date().valueOf()}.${
      req.query.fileExtension
    }`,
    Expires: 60,
    ContentType: req.query.contentType,
  };

  const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

  res.status(200).send({ signedUrl });
}
