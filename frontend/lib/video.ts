import { Dimensions } from "./image";

const videoExtensions = ["m4v", "avi", "mp4", "mov", "mpg", "mpeg"];
export const hasMovieExtension = (src: string) => {
  return videoExtensions.includes(src.split(".").pop()?.toLowerCase() || "");
};

export const extractVideoDimensions = async (
  file: File
): Promise<Dimensions> => {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.onloadedmetadata = (event) => {
        URL.revokeObjectURL(url);
        resolve({ width: video.videoWidth, height: video.videoHeight });
      };
      video.src = url;
      video.load();
    } catch (error) {
      console.error(error);
      resolve({ width: 300, height: 300 });
    }
  });
};
