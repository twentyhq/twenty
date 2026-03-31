import { styled } from '@linaria/react';
import NextImage from 'next/image';

import type { ImageType } from '@/design-system/components/Image/types/Image';
import { theme } from '@/theme';

const VisualArea = styled.div`
  background-color: ${theme.colors.primary.border[10]};
  height: 200px;
  overflow: hidden;
  position: relative;
  width: 100%;

  &[data-index='0'] {
    height: 220px;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 240px;

    &[data-index='0'] {
      height: 320px;
    }
  }
`;

const ImageInset = styled.div`
  bottom: 0;
  left: ${theme.spacing(4)};
  position: absolute;
  right: ${theme.spacing(4)};
  top: ${theme.spacing(4)};
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    left: ${theme.spacing(8)};
    right: ${theme.spacing(8)};
    top: ${theme.spacing(8)};

    &[data-index='0'] {
      left: 10%;
      right: 10%;
      top: ${theme.spacing(6)};
    }
    &[data-index='3'] {
      left: 0;
      right: 0;
    }
  }

  img {
    object-fit: contain;
    object-position: bottom center;
  }

  &[data-index='3'] img {
    object-position: bottom left;
  }
`;

const MaskOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  &[data-index='0'] img {
    object-position: center 20%;
  }
  &[data-index='1'] img {
    object-position: left 40%;
  }
  &[data-index='2'] img {
    object-position: right 40%;
  }
  &[data-index='3'] img {
    object-position: left 60%;
  }
  &[data-index='4'] img {
    object-position: right 60%;
  }
  &[data-index='5'] img {
    object-position: left 80%;
  }
  &[data-index='6'] img {
    object-position: right 80%;
  }
`;

type TileVisualProps = {
  image: ImageType;
  index: number;
  mask: ImageType;
};

export function TileVisual({ image, index, mask }: TileVisualProps) {
  return (
    <VisualArea data-index={index}>
      <ImageInset data-index={index}>
        <NextImage
          alt={image.alt}
          fill
          sizes="(min-width: 921px) 50vw, 100vw"
          src={image.src}
        />
      </ImageInset>
      <MaskOverlay aria-hidden data-index={index}>
        <NextImage
          alt={mask.alt}
          fill
          sizes="(min-width: 921px) 50vw, 100vw"
          src={mask.src}
        />
      </MaskOverlay>
    </VisualArea>
  );
}
