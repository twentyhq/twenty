import { useEffect } from 'react';

export type AvatarImageLoadErrorEffectProps = {
  avatarImageURI: string;
  onImageLoadError: (erroredImageURI: string) => void;
};

export const AvatarImageLoadErrorEffect = ({
  avatarImageURI,
  onImageLoadError,
}: AvatarImageLoadErrorEffectProps) => {
  useEffect(() => {
    const probeImage = new Image();
    probeImage.onerror = () => {
      onImageLoadError(avatarImageURI);
    };
    probeImage.src = avatarImageURI;

    return () => {
      probeImage.onerror = null;
      probeImage.src = '';
    };
  }, [avatarImageURI, onImageLoadError]);

  return <></>;
};
