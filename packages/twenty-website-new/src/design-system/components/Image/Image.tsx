import NextImage from 'next/image';
import { styled } from '@linaria/react';
import type { ImageType } from './types/Image';

const ImageRoot = styled.div`
  aspect-ratio: 16 / 9;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

export type ImageComponentProps = ImageType & { className?: string };

export function Image({ alt, className, src }: ImageComponentProps) {
  return (
    <ImageRoot className={className}>
      <NextImage
        alt={alt}
        fill
        sizes="100vw"
        src={src}
        style={{ objectFit: 'cover' }}
      />
    </ImageRoot>
  );
}
