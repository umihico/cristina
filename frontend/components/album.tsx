import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import NextJsImageLightBox from "../components/NextJsImage";
import NextJsImage from "../lib/nextJsImage";
import { Photo } from "../pages/api/photos";

type Props = {
  photos: Photo[];
};

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

// 写真追加時にアルバム全体の配置が動いてしまうので、最近ロードした画像だけで配置が調整されるようPhotoAlbumを分割する
const perPhotoAlbum = 15;

export const Album = ({ photos }: Props) => {
  const [lightBoxIndex, setLightBoxIndex] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <>
      {[...chunks(photos, perPhotoAlbum)].map(
        (chunkedPhotos, photoAlbumIndex) => (
          <PhotoAlbum
            // コンソールを開いた状態でlightboxなどのstateが動くと何故か再レンダー・通信が発生しチラつく
            layout="rows"
            padding={5}
            spacing={0}
            photos={chunkedPhotos}
            renderPhoto={NextJsImage}
            onClick={({ index: indexInPhotoAlbum }) => {
              const index = photoAlbumIndex * perPhotoAlbum + indexInPhotoAlbum;
              setLightBoxIndex(index);
              setOpen(true);
            }}
            key={photoAlbumIndex}
          />
        )
      )}
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
