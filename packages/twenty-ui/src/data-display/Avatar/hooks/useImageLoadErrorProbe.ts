import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';

// Probes an image URL off-DOM and reports whether it fails to load. Used when
// the image is painted as a CSS background, which exposes no error event.
export const useImageLoadErrorProbe = (imageURI: string | null) => {
  const [erroredImageURI, setErroredImageURI] = useState<string | null>(null);

  useEffect(() => {
    if (!isNonEmptyString(imageURI)) {
      return;
    }

    let isCancelled = false;
    const probeImage = new Image();
    probeImage.onerror = () => {
      if (!isCancelled) {
        setErroredImageURI(imageURI);
      }
    };
    probeImage.src = imageURI;

    return () => {
      isCancelled = true;
    };
  }, [imageURI]);

  return isNonEmptyString(imageURI) && erroredImageURI === imageURI;
};
