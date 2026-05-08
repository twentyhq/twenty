import type { ImageType } from '@/design-system/components/Image';
import { theme } from '@/theme';
import { css } from '@linaria/core';
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

const screenshotImageClassName = css`
  object-fit: cover;
`;

type ScreenshotProps = { image: ImageType };

export function Screenshot({ image }: ScreenshotProps) {
  return (
    <ScreenshotRoot>
      <NextImage
        alt={image.alt}
        className={screenshotImageClassName}
        fill
        sizes="(min-width: 921px) 800px, 100vw"
        src={image.src}
      />
    </ScreenshotRoot>
  );
}
