import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';

export const useImageLoadErrorProbe = (imageURI: string | null) => {
  const [erroredImageURI, setErroredImageURI] = useState<string | null>(null);

  useEffect(() => {
    if (!isNonEmptyString(imageURI)) {
      return;
    }

    const probeImage = new Image();
    probeImage.onerror = () => {
      setErroredImageURI(imageURI);
    };
    probeImage.src = imageURI;

    return () => {
      probeImage.onerror = null;
      probeImage.src = '';
    };
  }, [imageURI]);

  return isNonEmptyString(imageURI) && erroredImageURI === imageURI;
};
