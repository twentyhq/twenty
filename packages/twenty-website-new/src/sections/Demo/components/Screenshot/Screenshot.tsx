import type { ImageType } from '@/design-system/components/Image/types/Image';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const ScreenshotRoot = styled.div`
  aspect-ratio: 136 / 69;
  border-radius: ${theme.radius(4)};
  overflow: hidden;
  position: relative;
  width: 100%;
  max-width: 800px;
  margin-top: ${theme.spacing(12)};
  margin-bottom: ${theme.spacing(11)};

  @media (min-width: ${theme.breakpoints.md}px) {
    border-radius: ${theme.radius(6)};
    margin-top: ${theme.spacing(19)};
    margin-bottom: ${theme.spacing(11)};
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
        sizes="(min-width: 1440px) 1360px, 100vw"
        src={image.src}
      />
    </ScreenshotRoot>
  );
}
