import { Dispatch, SetStateAction } from "react";
import { fetchRetry } from "../lib/retry";
import { ImageType } from "../pages";

type Props = {
  uploadEach: (image: ImageType) => Promise<void>;
  setImages: Dispatch<SetStateAction<ImageType[]>>;
};

const generateMockPhotoUrl = () => {
  const size = `${Math.floor(Math.random() * 3000) + 100}x${
    Math.floor(Math.random() * 3000) + 100
  }`;
  const bgColor = Math.floor(Math.random() * 16777215).toString(16);
  const textColor = Math.floor(Math.random() * 16777215).toString(16);
  const format = ["jpg", "png", "gif"][Math.floor(Math.random() * 3)];

  const url = `https://dummyimage.com/${size}/${bgColor}/${textColor}.${format}?text=${size}`;

  return url;
};

const mockImage = async () => {
  const url = generateMockPhotoUrl();
  const response = await fetchRetry(url, {}, 5);
  const blob = await response.blob();
  const file = new File([blob], "image.jpg", { type: blob.type });
  return {
    dataURL: url,
    file,
    isMovie: false,
  };
};

export const InsertMockPhotoButton = ({ uploadEach, setImages }: Props) => {
  const insertMockPhoto = async () => {
    const response = await fetchRetry(generateMockPhotoUrl(), {}, 3);
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", { type: blob.type });
    await new Promise((resolve) => setTimeout(resolve, 300)); // useState が反映されるまで待つ
    const image = {
      file,
      dataURL: URL.createObjectURL(file),
      isMovie: false,
    };
    await uploadEach(image);
  };

  const insertMockImages = async () => {
    const images = await Promise.all(
      Array.from(Array(Math.floor(Math.random() * 10) + 1).keys()).map(
        async (_) => await mockImage()
      )
    );
    setImages(images);
  };

  return (
    <div className="flex">
      <button className="m-2 p-2 border" onClick={insertMockPhoto}>
        insertMockPhoto
      </button>
      <button className="m-2 p-2 border" onClick={insertMockImages}>
        insertMockImages
      </button>
    </div>
  );
};
