import React, { useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { requestInsertion } from "./api/dynamo";
import { requestSignedUrl } from "./api/sign";

export default function App() {
  const [count, setCount] = useState(null);

  const [images, setImages] = React.useState<ImageListType>([]);
  const maxNumber = 1;

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    setImages(imageList);
  };

  const onClick = async () => {
    const file = images[0]?.file;
    if (file === undefined) return;
    const response = await requestSignedUrl({
      fileExtension:
        file.name.split(".").pop() || file.type.split("/").pop() || "png",
      contentType: file.type,
      lastModified: String(file.lastModified),
    });
    const signedUrl = response.signedUrl;
    const options = {
      method: "PUT",
      body: images[0].file,
      headers: {
        "Content-Type": file.type,
      },
    };
    await fetch(signedUrl, options);
    const path = signedUrl.split(".s3.amazonaws.com/")[1].split("?")[0];
    await requestInsertion(path);
  };
  return (
    <div className="App">
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          // write your building UI
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            &nbsp;
            <button onClick={onImageRemoveAll}>Remove all images</button>
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image["data_url"]} alt="" width="100" />
                <div className="image-item__btn-wrapper">
                  <button onClick={() => onImageUpdate(index)}>Update</button>
                  <button onClick={() => onImageRemove(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ImageUploading>

      <div className="App">
        {count && <p>You clicked me {count} times.</p>}
        <button onClick={onClick}>Click Me!</button>
      </div>
    </div>
  );
}
