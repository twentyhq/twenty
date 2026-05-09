import { useEffect, useState } from 'react';

export function useImageElement(imageFile: File | null) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );

  useEffect(() => {
    if (!imageFile) {
      setImageElement(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => setImageElement(img);
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return imageElement;
}
