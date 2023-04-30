import Image from "next/image";
import { useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { MdPlayCircle } from "react-icons/md";
import type { RenderPhotoProps } from "react-photo-album";
import { LoadingEffect } from "../components/LoadingEffect";
import { hasMovieExtension } from "./video";

export default function NextJsImage({
  imageProps: { src: initialSrc, alt, title, sizes, className, onClick, style },
  wrapperStyle,
}: RenderPhotoProps) {
  const [completed, setCompleted] = useState(false);
  const [src, setSrc] = useState(initialSrc);
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * To avoid 429 (The rate limit is 10 requests per second...)
   * Such as {"Reason":"ConcurrentInvocationLimitExceeded","Type":"User","message":"Rate Exceeded."}
   * @param e
   * @returns
   */
  const retryLaterIfConcurrentInvocationLimitExceeded = async (e: any) => {
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );
    if (completed) return;
    setSrc("");
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );
    if (completed) return;
    setSrc(initialSrc);
  };

  const isMovie = hasMovieExtension(src);

  return (
    <div style={wrapperStyle}>
      {isMovie ? (
        <div className="relative w-full h-full">
          <div
            onClick={onClick}
            className="absolute top-0 left-0 w-full h-full flex justify-center items-center cursor-pointer z-10"
          >
            <MdPlayCircle className="color-black w-12 h-12 bg-white p-px rounded-full"></MdPlayCircle>
          </div>
          <video
            ref={videoRef}
            autoPlay={isMobile} // without autoPlay, iOS won't show even preview somehow
            muted
            onTimeUpdate={() =>
              // pause immediately to avoid auto play, autoPlay is enabled to just preview the first frame
              videoRef.current?.pause()
            }
            src={src}
            className="w-full h-full"
          ></video>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {!completed && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center cursor-pointer z-10 bg-gray-200">
              <LoadingEffect></LoadingEffect>
            </div>
          )}
          <Image
            fill
            loading="eager"
            src={src}
            alt={alt}
            title={title}
            sizes={sizes}
            className={className}
            onClick={onClick}
            quality={25}
            onError={retryLaterIfConcurrentInvocationLimitExceeded}
            onLoadingComplete={() => setCompleted(true)}
          />
        </div>
      )}
    </div>
  );
}
