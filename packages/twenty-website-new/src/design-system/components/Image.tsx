import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const coverImageClassName = css`
  object-fit: cover;
`;

export type ImageType = {
  alt: string;
  src: string;
};

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
        className={coverImageClassName}
        fill
        sizes="100vw"
        src={src}
      />
    </ImageRoot>
  );
}
