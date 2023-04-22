import { GetServerSideProps } from "next";
import Image from "next/image";
import React, { useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdOutlineAdd } from "react-icons/md";
import ImageUploading, { ImageListType } from "react-images-uploading";
import "yet-another-react-lightbox/styles.css";
import { Album } from "../components/album";
import { Loader } from "../components/loader";
import { InsertMockPhotoButton } from "../components/mock";
import { extractDimensions } from "../lib/image";
import { requestInsertion } from "./api/dynamo";
import {
  Photo,
  fetchPhotos,
  fetchPhotosByApi,
  limitPerPage,
} from "./api/photos";
import { requestSignedUrl } from "./api/sign";
import s from "./style.module.scss";

type Props = {
  photos: Photo[];
  initialLoadEnabled: boolean;
  displayInsertMockPhotoButton: boolean;
};

export default function App({
  photos: initPhotos,
  initialLoadEnabled,
  displayInsertMockPhotoButton,
}: Props) {
  const [loadEnabled, setLoadEnabled] = React.useState(initialLoadEnabled);
  const [minDisplayOrder, setMinDisplayOrder] = React.useState(0);
  const [photos, setPhotos] = React.useState<Photo[]>(initPhotos);
  useEffect(() => {
    if (photos.length === 0) return;
    setMinDisplayOrder(photos[photos.length - 1].displayOrder);
  }, [photos]);
  const [images, setImages] = React.useState<ImageListType>([]);
  const [processing, setProcessing] = React.useState(false);
  const upload = async (file: File) => {
    setProcessing(true);
    try {
      const response = await requestSignedUrl({
        fileExtension:
          file.name.split(".").pop() || file.type.split("/").pop() || "png",
        contentType: file.type,
        lastModified: String(file.lastModified),
      });
      const signedUrl = response.signedUrl;
      const options = {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      };
      await fetch(signedUrl, options);
      const path = signedUrl.split(".amazonaws.com/")[1].split("?")[0];
      const { width, height } = await extractDimensions(file);
      await requestInsertion({ path, width, height });

      setPhotos((await fetchPhotosByApi(0)).photos);
    } catch (error) {
      alert(error);
      throw error;
    } finally {
      setImages([]);
      setProcessing(false);
    }
  };
  const loadMoreAlbum = async () => {
    if (minDisplayOrder === null) return;

    const { photos: olderPhotos } = await fetchPhotosByApi(minDisplayOrder);
    if (olderPhotos.length < limitPerPage) {
      setLoadEnabled(false);
    }
    setPhotos((prev) => [...prev, ...olderPhotos]);
  };
  return (
    <>
      {processing && <Loader></Loader>}
      <div className="mx-auto w-full sm:w-10/12 md:w-9/12 lg:w-8/12 xl:w-7/12">
        {displayInsertMockPhotoButton && (
          <InsertMockPhotoButton upload={upload}></InsertMockPhotoButton>
        )}
        <Image
          className="mx-auto"
          src="/assets/title.webp"
          alt="header"
          height={256 * 0.8}
          width={652 * 0.8}
        />
        <div className="text-right w-full">
          <span>CASTELBRANDO 1 MAGGIO 2023</span>
        </div>
        <Album photos={photos}></Album>
        <div className="flex justify-center items-center w-full h-16 my-4">
          {loadEnabled && (
            <button
              className="w-1/2 h-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl md:text-3xl font-bold"
              onClick={loadMoreAlbum}
            >
              More?
            </button>
          )}
        </div>
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
                  onClick={() => {
                    const file = images[0]?.file;
                    if (file === undefined) return;
                    upload(file);
                  }}
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
  const stage = String(process.env.STAGE);
  const displayInsertMockPhotoButton = stage !== "prod";
  const { photos } = await fetchPhotos({});
  const initialLoadEnabled = photos.length >= limitPerPage;
  return {
    props: { photos, initialLoadEnabled, displayInsertMockPhotoButton },
  };
};
