import { atom } from "recoil";

export const loadingConcurrencyCountState = atom({
  key: "loadingConcurrencyCountState",
  default: 10, // default value (aka initial value)
});

export type Dimensions = {
  width: number;
  height: number;
};

export const extractImageDimensions = async (
  file: File
): Promise<Dimensions> => {
  return await Promise.race([
    new Promise((resolve) => {
      try {
        const movie = new Audio();
        movie.preload = "metadata";
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          resolve({ width: image.width, height: image.height });
        };
      } catch (error) {
        console.error(error);
        resolve({ width: 300, height: 300 });
      }
    }) as Promise<Dimensions>,
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ width: 300, height: 300 });
      }, 3000);
    }) as Promise<Dimensions>,
  ]);
};

// https://codesandbox.io/s/github/igordanchenko/react-photo-album/tree/main/examples/sortable-gallery?file=/src/photos.ts:0-1798
const unsplashLink = (id: string, width: number, height: number) =>
  `https://source.unsplash.com/${id}/${width}x${height}`;

const unsplashPhotosArray = [
  { id: "Osq7UAVxIOI", width: 1080, height: 780 },
  { id: "Dhmn6ete6g8", width: 1080, height: 1620 },
  { id: "RkBTPqPEGDo", width: 1080, height: 720 },
  { id: "Yizrl9N_eDA", width: 1080, height: 721 },
  { id: "KG3TyFi0iTU", width: 1080, height: 1620 },
  { id: "Jztmx9yqjBw", width: 1080, height: 607 },
  { id: "-heLWtuAN3c", width: 1080, height: 608 },
  { id: "xOigCUcFdA8", width: 1080, height: 720 },
  { id: "1azAjl8FTnU", width: 1080, height: 1549 },
  { id: "ALrCdq-ui_Q", width: 1080, height: 720 },
  { id: "twukN12EN7c", width: 1080, height: 694 },
  { id: "9UjEyzA6pP4", width: 1080, height: 1620 },
  { id: "sEXGgun3ZiE", width: 1080, height: 720 },
  { id: "S-cdwrx-YuQ", width: 1080, height: 1440 },
  { id: "q-motCAvPBM", width: 1080, height: 1620 },
  { id: "Xn4L310ztMU", width: 1080, height: 810 },
  { id: "iMchCC-3_fE", width: 1080, height: 610 },
  { id: "X48pUOPKf7A", width: 1080, height: 160 },
  { id: "GbLS6YVXj0U", width: 1080, height: 810 },
  { id: "9CRd1J1rEOM", width: 1080, height: 720 },
  { id: "xKhtkhc9HbQ", width: 1080, height: 1440 },
];

export const unsplashPhotos = unsplashPhotosArray.map((photo) => {
  return {
    src: unsplashLink(photo.id, photo.width, photo.height),
    width: photo.width,
    height: photo.height,
  };
});
