import { GetServerSideProps } from "next";
import Image from "next/image";
import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdOutlineAdd } from "react-icons/md";
import ImageUploading, { ImageListType } from "react-images-uploading";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import NextJsImageLightBox from "../components/NextJsImage";
import { Loader } from "../components/loader";
import { extractDimensions } from "../lib/image";
import NextJsImage from "../lib/nextJsImage";
import { requestInsertion } from "./api/dynamo";
import { Photo, fetchPhotos, fetchPhotosByApi } from "./api/photos";
import { requestSignedUrl } from "./api/sign";
import s from "./style.module.scss";

type Props = {
  photos: Photo[];
};

export default function App({ photos: initPhotos }: Props) {
  const [open, setOpen] = React.useState(false);
  const [lightBoxIndex, setLightBoxIndex] = React.useState(0);
  const [photos, setPhotos] = React.useState<Photo[]>(initPhotos);
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
      setPhotos((await fetchPhotosByApi()).photos);
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
        <PhotoAlbum
          layout="rows"
          padding={5}
          spacing={0}
          photos={photos}
          renderPhoto={NextJsImage}
          onClick={({ index }) => {
            setLightBoxIndex(index);
            setOpen(true);
          }}
        />
        {/* PhotoAlbumとLightboxを同列に置くと再レンダー・通信が発生してチラつく？divタグで直ってるかは不明、Console開くと発現する？ */}
        <div>
          <Lightbox
            styles={{
              container: { backgroundColor: "rgba(0, 0, 0, .8)" },
            }}
            open={open}
            index={lightBoxIndex}
            close={() => setOpen(false)}
            slides={photos}
            render={{ slide: NextJsImageLightBox }}
          />
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
  return {
    props: {
      photos: await fetchPhotos(),
    },
  };
};
