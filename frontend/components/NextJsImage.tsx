import Image from "next/image";
import { RenderSlideProps, SlideImage } from "yet-another-react-lightbox";
import {
  isImageFitCover,
  isImageSlide,
  useLightboxProps,
} from "yet-another-react-lightbox/core";
import { hasMovieExtension } from "../lib/video";

// not sure this type is right
type Props = RenderSlideProps & {
  slide: SlideImage;
};

export default function NextJsImage({ slide, rect }: Props) {
  const { imageFit } = useLightboxProps().carousel;
  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit);

  const width = !cover
    ? Math.round(
        Math.min(rect.width, (rect.height / slide.height!) * slide.width!)
      )
    : rect.width;

  const height = !cover
    ? Math.round(
        Math.min(rect.height, (rect.width / slide.width!) * slide.height!)
      )
    : rect.height;

  const isMovie = hasMovieExtension(slide.src);

  return (
    <div style={{ position: "relative", width, height }}>
      {isMovie ? (
        <video src={slide.src} className="w-full h-full" controls></video>
      ) : (
        <Image
          fill
          alt=""
          src={slide.src}
          loading="eager"
          draggable={false}
          style={{ objectFit: cover ? "cover" : "contain" }}
          sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        />
      )}
    </div>
  );
}
