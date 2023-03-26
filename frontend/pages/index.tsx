import { GetServerSideProps } from "next";
import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdOutlineAdd } from "react-icons/md";
import ImageUploading, { ImageListType } from "react-images-uploading";
import PhotoAlbum from "react-photo-album";
import { Loader } from "../components/loader";
import { dynamoDb, dynamoDbTableName } from "../lib/aws/dynamodb";
import { s3Host } from "../lib/aws/s3";
import { extractDimensions, unsplashPhotos } from "../lib/image";
import NextJsImage from "../lib/nextJsImage";
import { requestInsertion } from "./api/dynamo";
import { requestSignedUrl } from "./api/sign";
import s from "./style.module.scss";

type Props = {
  photos: {
    src: string;
    width: number;
    height: number;
  }[];
};

export default function App({ photos }: Props) {
  const [images, setImages] = React.useState<ImageListType>([]);
  const [processing, setProcessing] = React.useState(false);

  const upload = async () => {
    setProcessing(true);
    try {
      const file = images[0]?.file;
      if (file === undefined) return;
      const response = await requestSignedUrl({
        fileExtension:
          file.name.split(".").pop() || file.type.split("/").pop() || "png",
        contentType: file.type,
        lastModified: String(file.lastModified),
      });
      const signedUrl = response.signedUrl;
      const options = {
        method: "PUT",
        body: images[0].file,
        headers: {
          "Content-Type": file.type,
        },
      };
      await fetch(signedUrl, options);
      const path = signedUrl.split(".s3.amazonaws.com/")[1].split("?")[0];
      const { width, height } = await extractDimensions(file);
      await requestInsertion({ path, width, height });
    } catch (error) {
      alert(error);
    } finally {
      setImages([]);
      setProcessing(false);
    }
  };
  return (
    <>
      {processing && <Loader></Loader>}
      <div className="mx-auto w-full sm:w-10/12 md:w-9/12 lg:w-8/12 xl:w-7/12">
        <PhotoAlbum
          layout="rows"
          padding={5}
          spacing={0}
          photos={photos}
          renderPhoto={NextJsImage}
        />
        <ImageUploading
          multiple
          value={images}
          onChange={(
            imageList: ImageListType,
            addUpdateIndex: number[] | undefined
          ) => {
            // data for submit
            setImages(imageList);
          }}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({ onImageUpload }) => (
            <div>
              <MdOutlineAdd
                onClick={onImageUpload}
                className={`${s.MdOutlineAdd} cursor-pointer fixed h-16 w-16 md:h-20 md:w-20 bottom-8 right-8`}
              ></MdOutlineAdd>
            </div>
          )}
        </ImageUploading>
        {images.length > 0 && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-10 flex items-center justify-center">
            <div className="w-11/12 flex items-center justify-center">
              <img
                className="object-contain w-full max-h-96 max-w-sm"
                src={images[0]["data_url"]}
              />
            </div>
            <div className="fixed bottom-0 left-0 w-full justify-center flex">
              <div className="items-center flex w-full max-w-lg">
                <button
                  onClick={() => setImages([])}
                  className={`w-1/2 h-12 m-4 rounded-lg border-2 border-white bg-red-500 text-white flex justify-center items-center`}
                >
                  <FaTimes />
                </button>
                <button
                  onClick={upload}
                  className={`w-1/2 h-12 m-4 rounded-lg border-2 border-white bg-green-500 text-white flex justify-center items-center`}
                >
                  <FaCheck />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = {
    TableName: dynamoDbTableName,
  };

  const response = await dynamoDb.scan(params).promise();
  const photos = [
    ...(response.Items || []).map((item) => ({
      src: `https://${s3Host}/${item.s3_path}`,
      width: item.width || 300,
      height: item.height || 300,
    })),
    ...unsplashPhotos,
  ];
  return {
    props: {
      photos,
    },
  };
};
