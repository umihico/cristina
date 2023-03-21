import { GetServerSideProps } from "next";
import React from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import PhotoAlbum from "react-photo-album";
import { dynamoDb, dynamoDbTableName } from "../lib/aws/dynamodb";
import { s3Host } from "../lib/aws/s3";
import { extractDimensions, unsplashPhotos } from "../lib/image";
import NextJsImage from "../lib/nextJsImage";
import { requestInsertion } from "./api/dynamo";
import { requestSignedUrl } from "./api/sign";

type Props = {
  photos: {
    src: string;
    width: number;
    height: number;
  }[];
};

export default function App({ photos }: Props) {
  const [images, setImages] = React.useState<ImageListType>([]);
  const maxNumber = 1;

  const onChange = async (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    setImages(imageList);
  };

  const onClick = async () => {
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
  };
  return (
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
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          // write your building UI
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            &nbsp;
            <button onClick={onImageRemoveAll}>Remove all images</button>
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image["data_url"]} alt="" width="100" />
                <div className="image-item__btn-wrapper">
                  <button onClick={() => onImageUpdate(index)}>Update</button>
                  <button onClick={() => onImageRemove(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ImageUploading>
      <div>
        <button onClick={onClick}>Click Me!</button>
      </div>
    </div>
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
