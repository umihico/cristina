type Props = {
  upload: (file: File) => Promise<void>;
};

const generateMockPhotoUrl = async () => {
  const size = `${Math.floor(Math.random() * 3000) + 100}x${
    Math.floor(Math.random() * 3000) + 100
  }`;
  const bgColor = Math.floor(Math.random() * 16777215).toString(16);
  const textColor = Math.floor(Math.random() * 16777215).toString(16);
  const format = ["jpg", "png", "gif"][Math.floor(Math.random() * 3)];

  const url = `https://dummyimage.com/${size}/${bgColor}/${textColor}.${format}?text=${size}`;

  return url;
};

export const InsertMockPhotoButton = ({ upload }: Props) => {
  const insertMockPhoto = async () => {
    const response = await fetch(await generateMockPhotoUrl());
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", { type: blob.type });
    await new Promise((resolve) => setTimeout(resolve, 300)); // useState が反映されるまで待つ
    await upload(file);
  };
  return <button onClick={insertMockPhoto}>insertMockPhoto</button>;
};
