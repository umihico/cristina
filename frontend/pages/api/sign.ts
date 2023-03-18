import AWS from "aws-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

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

export const s3 = new AWS.S3({
  apiVersion: "2010-12-01",
  signatureVersion: "v4",
  region: process.env.REGION,
});

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
