'use client';

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

    const handleLoad = () => {
      if (!cancelled) {
        setImageElement(img);
      }
    };

    const handleError = () => {
      if (!cancelled) {
        setImageElement(null);
      }
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = url;

    return () => {
      cancelled = true;
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  return imageElement;
}
