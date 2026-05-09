import type { ImageType } from '@/design-system/components/Image';
import { css } from '@linaria/core';

const coverImageClassName = css`
  object-fit: cover;
`;
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const ScreenshotRoot = styled.div`
  aspect-ratio: 136 / 69;
  border-radius: ${theme.radius(4)};
  margin-bottom: ${theme.spacing(11)};
  margin-top: ${theme.spacing(12)};
  max-width: 800px;
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    border-radius: ${theme.radius(6)};
    margin-top: ${theme.spacing(19)};
  }
`;

type ScreenshotProps = { image: ImageType };

export function Screenshot({ image }: ScreenshotProps) {
  return (
    <ScreenshotRoot>
      <NextImage
        alt={image.alt}
        className={coverImageClassName}
        fill
        sizes="(min-width: 921px) 800px, 100vw"
        src={image.src}
      />
    </ScreenshotRoot>
  );
}
