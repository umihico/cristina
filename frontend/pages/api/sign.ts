import type { NextApiRequest, NextApiResponse } from "next";
import { s3 } from "../../lib/aws/s3";

export const requestSignedUrl = async (
  fileExtension: string,
  contentType: string
): Promise<SignatureResponseData> =>
  fetch(`/api/sign?contentType=${contentType}&fileExtension=${fileExtension}`, {
    method: "POST",
  }).then((x) => x.json());

export type SignatureResponseData = {
  signedUrl: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignatureResponseData>
) {
  const s3Params = {
    Bucket: process.env.BUCKET_NAME || "cristina-umihico-ImageBucket",
    Key: `images/${new Date().valueOf()}.${req.query.fileExtension}`,
    Expires: 60,
    ContentType: req.query.contentType,
  };

  const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

  res.status(200).send({ signedUrl });
}
