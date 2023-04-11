import Image from "next/image";
import { useState } from "react";
import type { RenderPhotoProps } from "react-photo-album";
import { placeholderSvg } from "./image";

export default function NextJsImage({
  imageProps: { src: initialSrc, alt, title, sizes, className, onClick, style },
  wrapperStyle,
}: RenderPhotoProps) {
  const [src, setSrc] = useState(initialSrc);
  const [errorCount, setErrorCount] = useState(0);

  /**
   * To avoid 429 (The rate limit is 10 requests per second...)
   * Such as {"Reason":"ConcurrentInvocationLimitExceeded","Type":"User","message":"Rate Exceeded."}
   * @param e
   * @returns
   */
  const retryLaterIfConcurrentInvocationLimitExceeded = (e: any) => {
    setSrc(placeholderSvg);
    if (errorCount > 10) return;
    setTimeout(() => {
      setSrc(initialSrc);
    }, Math.random() * 200 * errorCount);
    setErrorCount((prev) => prev + 1);
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Image
          fill
          loading="eager" // eagerにすることで、lightboxのon/offで再renderされ通信・画面チラつきを抑える試み（改善結果不明瞭・原因不明）
          src={src}
          alt={alt}
          title={title}
          sizes={sizes}
          className={className}
          onClick={onClick}
          quality={25}
          onError={retryLaterIfConcurrentInvocationLimitExceeded}
        />
      </div>
    </div>
  );
}
