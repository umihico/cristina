import { GetServerSideProps } from "next";
import Image from "next/image";
import React, { useEffect } from "react";
import { isMobile } from "react-device-detect";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdOutlineAdd } from "react-icons/md";
import "yet-another-react-lightbox/styles.css";
import { LoadingEffect } from "../components/LoadingEffect";
import { Album } from "../components/album";
import { InsertMockPhotoButton } from "../components/mock";
import { extractImageDimensions } from "../lib/image";
import { extractVideoDimensions } from "../lib/video";
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

export type ImageType = {
  file: File;
  dataURL: string;
  isMovie: boolean;
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
  const [tasks, setTasks] = React.useState<ImageType[]>([]);
  const [currentTask, setCurrentTask] = React.useState<ImageType | null>(null);
  const [images, setImages] = React.useState<ImageType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (tasks.length === 0) {
          const latestPhotos = (await fetchPhotosByApi(0)).photos;
          setPhotos(latestPhotos);
          setCurrentTask(null);
          if (latestPhotos.length >= limitPerPage) {
            setLoadEnabled(true);
          }
          setImages([]);
          return;
        }

        setPhotos([]);

        const task = tasks[0];
        setCurrentTask(task);

        await uploadEach(task);
        const restTasks = tasks.slice(1);
        setTasks(restTasks);
      } catch (error) {
        setTasks([]);
        alert(error);
        setCurrentTask(null);
        throw error;
      }
    })();
  }, [tasks]);

  const uploadEach = async (task: ImageType) => {
    const file = task.file;
    const response = await requestSignedUrl({
      fileExtension: (
        file.name.split(".").pop() ||
        file.type.split("/").pop() ||
        "png"
      ).toLowerCase(),
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
    const { width, height } = task.isMovie
      ? await extractVideoDimensions(file)
      : await extractImageDimensions(file);
    await requestInsertion({ path, width, height });
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
      <div className="mx-auto w-full sm:w-10/12 md:w-9/12 lg:w-8/12 xl:w-7/12">
        {displayInsertMockPhotoButton && (
          <InsertMockPhotoButton
            uploadEach={uploadEach}
            setImages={setImages}
          ></InsertMockPhotoButton>
        )}
        <Image
          className="mx-auto"
          src="/assets/title.webp.jpg" // 背景透過のオリジナルwebpとcfのカスタムキャッシュポリシーを同時に使うと、なぜか背景が黒になってしまったので、jpgに変換して使う
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
        <label aria-label="add image">
          <MdOutlineAdd
            className={`${s.MdOutlineAdd} cursor-pointer fixed h-16 w-16 md:h-20 md:w-20 bottom-8 right-8`}
          ></MdOutlineAdd>
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={(e) => {
              const rawFiles = e.target.files;
              if (rawFiles === null) return;
              const files = Array.from(Array(rawFiles.length).keys())
                .map((i) => {
                  return rawFiles.item(i);
                })
                .filter((file): file is File => file !== null);
              setImages(
                files.map((file) => {
                  return {
                    file,
                    isMovie: file.type.startsWith("video/"),
                    dataURL: URL.createObjectURL(file),
                  };
                })
              );
            }}
          ></input>
        </label>
        {images.length > 0 && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-10 flex items-center justify-center">
            <div className="w-11/12 flex flex-wrap items-center justify-center">
              {images.map((image, index) => {
                const width =
                  window.innerWidth ||
                  document.documentElement.clientWidth ||
                  document.body.clientWidth;

                const height =
                  window.innerHeight ||
                  document.documentElement.clientHeight ||
                  document.body.clientHeight;

                const size = Math.round(
                  (Math.min(width, height) / Math.sqrt(images.length)) * 0.8
                );

                const isUploading =
                  currentTask?.file && currentTask?.file === image.file;
                return (
                  <div
                    key={index}
                    className="m-1 relative"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                  >
                    {isUploading && (
                      <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-50">
                        <LoadingEffect></LoadingEffect>
                      </div>
                    )}
                    {image.file.type.startsWith("image") ? (
                      <img
                        src={image.dataURL}
                        className={`object-contain h-full w-full ${
                          isUploading ? "grayscale" : ""
                        }`}
                      />
                    ) : (
                      <video
                        autoPlay={isMobile} // without autoPlay, iOS won't show even preview somehow
                        muted
                        src={image.dataURL}
                        className={`object-contain h-full w-full ${
                          isUploading ? "grayscale" : ""
                        }`}
                      ></video>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="fixed bottom-0 left-0 w-full justify-center flex">
              <div className="items-center flex w-full max-w-lg">
                <button
                  disabled={tasks.length > 0}
                  onClick={() => setImages([])}
                  className={`w-1/2 h-12 m-4 rounded-lg border-2 border-white bg-gray-500 text-white flex justify-center items-center`}
                >
                  <FaTimes />
                </button>
                <button
                  disabled={tasks.length > 0}
                  onClick={async () => {
                    setTasks(images);
                  }}
                  className={`w-1/2 h-12 m-4 rounded-lg border-2 border-white bg-green-500 text-white flex justify-center items-center disabled:bg-gray-500`}
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
