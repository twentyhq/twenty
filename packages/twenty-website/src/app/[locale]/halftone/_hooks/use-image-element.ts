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

    let cancelled = false;
    const url = URL.createObjectURL(imageFile);
    const img = new Image();

    img.onload = () => {
      if (!cancelled) {
        setImageElement(img);
      }
    };

    img.onerror = () => {
      if (!cancelled) {
        setImageElement(null);
      }
    };

    img.src = url;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  return imageElement;
}
