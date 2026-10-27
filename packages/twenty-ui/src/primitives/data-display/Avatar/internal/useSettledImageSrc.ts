import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';

import { type AvatarImageProps } from '../types/AvatarImageProps';

export const useSettledImageSrc = (
  src: string | undefined,
  {
    crossOrigin,
    referrerPolicy,
  }: Pick<AvatarImageProps, 'crossOrigin' | 'referrerPolicy'> = {},
) => {
  const [settledSrc, setSettledSrc] = useState(src);

  useEffect(() => {
    if (src === settledSrc) {
      return;
    }

    if (!isNonEmptyString(src) || !isNonEmptyString(settledSrc)) {
      setSettledSrc(src);
      return;
    }

    let isCancelled = false;
    const image = new window.Image();
    const settle = () => {
      if (!isCancelled) {
        setSettledSrc(src);
      }
    };

    image.onload = settle;
    image.onerror = settle;
    image.crossOrigin = crossOrigin ?? null;
    if (isNonEmptyString(referrerPolicy)) {
      image.referrerPolicy = referrerPolicy;
    }
    image.src = src;

    return () => {
      isCancelled = true;
    };
  }, [src, settledSrc, crossOrigin, referrerPolicy]);

  return settledSrc;
};
