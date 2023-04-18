import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import NextJsImageLightBox from "../components/NextJsImage";
import NextJsImage from "../lib/nextJsImage";
import { Photo } from "../pages/api/photos";

type Props = {
  photos: Photo[];
};

export const Album = ({ photos }: Props) => {
  const [lightBoxIndex, setLightBoxIndex] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PhotoAlbum
        // コンソールを開いた状態でlightboxなどのstateが動くと何故か再レンダー・通信が発生しチラつく
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
      <Lightbox
        animation={{ swipe: 0 }} // 本番・スマホ環境でswipeあると前の画像が何故か一瞬表示されチラつくのでOFFに
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .8)" },
        }}
        open={open}
        index={lightBoxIndex}
        close={() => setOpen(false)}
        slides={photos}
        render={{ slide: NextJsImageLightBox }}
      />
    </>
  );
};
