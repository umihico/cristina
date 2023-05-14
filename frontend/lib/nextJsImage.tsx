import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { MdPlayCircle } from "react-icons/md";
import type { RenderPhotoProps } from "react-photo-album";
import { useRecoilValue } from "recoil";
import { LoadingEffect } from "../components/LoadingEffect";
import { devModeState } from "../pages";
import { Photo } from "../pages/api/photos";
import { hasMovieExtension } from "./video";

export default function NextJsImage({
  layout: { index },
  imageProps: { src: initialSrc, alt, title, sizes, className, onClick, style },
  wrapperStyle,
  photo,
}: RenderPhotoProps) {
  const [retryTask, setRetryTask] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [src, setSrc] = useState(initialSrc);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [fetchTryCount, setFetchTryCount] = useState(0);
  const devMode = useRecoilValue(devModeState);

  /**
   * To avoid 429 (The rate limit is 10 requests per second...)
   * Such as {"Reason":"ConcurrentInvocationLimitExceeded","Type":"User","message":"Rate Exceeded."}
   * https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html#api-requests
   * > Each instance of your execution environment can serve up to 10 requests per second.
   * @param e
   * @returns
   */
  const retryLaterIfConcurrentInvocationLimitExceeded = (e: any) => {
    setRetryTask(true);
  };

  useEffect(() => {
    if (!retryTask) return;
    // fetchTryCountが小刻みに動くので、onErrorが呼ばれるタイミングが想定より不透明に多く、頻繁な模様。
    // そのため、retryTask+useEffectで多重に実行されないようにする

    (async () => {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          // emptyの状態からonErrorが発火しない状況を観測し、待機時間が異常に短くなったためと思われるので、最低1秒待つ
          1000 + 1000 * Math.random() * Math.min(fetchTryCount, 20)
        )
      );
      if (completed) return; // 起こることはないはず
      setFetchTryCount(fetchTryCount + 1);
      setRetryTask(false);
      // 再トライしても429が返ってくるので、URLを変える
      // コンソールを開くと治る＝disable cacheがきいているためなので、URLを変えることで対応
      setSrc(src === "" ? `${initialSrc}?retry=${fetchTryCount}` : "");
    })();
  }, [retryTask]);

  const isMovie = hasMovieExtension(src);

  return (
    <div style={wrapperStyle} className="relative">
      {devMode && (
        <div className="absolute top-0 left-0 z-10 bg-white p-1 bg-opacity-50">
          {`ID:${(photo as Photo).displayOrder
            .toString()
            .replace(/\B(?=(\d{4})+(?!\d))/g, " ")}`}
        </div>
      )}
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
            <div className="loading-photo absolute top-0 left-0 w-full h-full flex justify-center items-center cursor-pointer z-10 bg-gray-200">
              <div>
                <LoadingEffect></LoadingEffect>
                {devMode && (
                  <>
                    <div>cnt: {fetchTryCount}</div>
                    <a href={src} target="_blank">
                      {src === "" ? "src(empty)" : "src"}
                    </a>
                  </>
                )}
              </div>
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
