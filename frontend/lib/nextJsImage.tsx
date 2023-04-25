import Image from "next/image";
import { useState } from "react";
import { MdPlayCircle } from "react-icons/md";
import type { RenderPhotoProps } from "react-photo-album";
import { LoadingEffect } from "../components/LoadingEffect";
import { hasMovieExtension } from "./video";

export default function NextJsImage({
  photo: { height, width },
  imageProps: { src: initialSrc, alt, title, sizes, className, onClick, style },
  wrapperStyle,
}: RenderPhotoProps) {
  const [showLoading, setShowLoading] = useState(true);
  const [src, setSrc] = useState(initialSrc);
  const [errorCount, setErrorCount] = useState(0);

  /**
   * To avoid 429 (The rate limit is 10 requests per second...)
   * Such as {"Reason":"ConcurrentInvocationLimitExceeded","Type":"User","message":"Rate Exceeded."}
   * @param e
   * @returns
   */
  const retryLaterIfConcurrentInvocationLimitExceeded = (e: any) => {
    setSrc("");
    setTimeout(() => {
      setSrc(initialSrc);
    }, Math.random() * 100 * errorCount * errorCount);
    setErrorCount((prev) => prev + 1);
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
          <video src={src} className="w-full h-full"></video>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {showLoading && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center cursor-pointer z-10">
              <LoadingEffect></LoadingEffect>
            </div>
          )}
          <Image
            loading="eager"
            src={src}
            alt={alt}
            title={title}
            height={height}
            width={width}
            className={className}
            onClick={onClick}
            quality={25}
            onError={retryLaterIfConcurrentInvocationLimitExceeded}
            onLoadingComplete={() => setShowLoading(false)}
          />
        </div>
      )}
    </div>
  );
}
