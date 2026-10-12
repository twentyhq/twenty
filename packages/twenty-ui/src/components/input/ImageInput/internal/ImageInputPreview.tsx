import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { IconPhotoUp } from '@ui/icon';
import { useTheme } from '@ui/theme';

import styles from '../ImageInput.module.scss';

type ImageInputPreviewProps = {
  src?: string | null;
};

export const ImageInputPreview = ({ src }: ImageInputPreviewProps) => {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  if (!isNonEmptyString(src) || hasError) {
    return <IconPhotoUp size={theme.icon.size.lg} aria-hidden />;
  }

  return (
    <img
      className={styles.image}
      src={src}
      alt=""
      onError={() => setHasError(true)}
    />
  );
};
