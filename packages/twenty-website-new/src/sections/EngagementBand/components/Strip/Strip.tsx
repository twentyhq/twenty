import { EngagementBandShape } from '@/sections/EngagementBand/EngagementBandShape';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

const ENGAGEMENT_BAND_OVERLAY_SRC =
  '/images/pricing/engagement-band/overlay.webp';

const OverlayLayer = styled.div`
  bottom: 0;
  left: 60%;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const overlayImageClassName = css`
  object-fit: cover;
  object-position: right center;
`;

const StyledStrip = styled.div`
  border-radius: ${theme.radius(1)};
  display: grid;
  grid-template-columns: 1fr;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding-top: ${theme.spacing(6)};
  padding-right: ${theme.spacing(4)};
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(6)};
  position: relative;
  row-gap: ${theme.spacing(6)};
  z-index: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(2)};
    grid-template-columns: minmax(0, 668px) minmax(0, 1fr);
    padding-right: ${theme.spacing(16)};
    row-gap: 0;
  }

  &[data-has-custom-copy-max-width='true'] {
    @media (min-width: ${theme.breakpoints.md}px) {
      grid-template-columns:
        fit-content(var(--engagement-band-copy-max-width))
        minmax(0, 1fr);
    }
  }

  &[data-variant='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-variant='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }
`;

type StripProps = {
  children: ReactNode;
  desktopCopyMaxWidth?: string;
  fillColor: string;
  variant: 'primary' | 'secondary';
};

export function Strip({
  children,
  desktopCopyMaxWidth,
  fillColor,
  variant,
}: StripProps) {
  const style = desktopCopyMaxWidth
    ? ({
        '--engagement-band-copy-max-width': desktopCopyMaxWidth,
      } as CSSProperties)
    : undefined;

  return (
    <StyledStrip
      data-has-custom-copy-max-width={Boolean(desktopCopyMaxWidth)}
      data-variant={variant}
      style={style}
    >
      <EngagementBandShape fillColor={fillColor} />
      <OverlayLayer aria-hidden>
        <NextImage
          alt=""
          className={overlayImageClassName}
          fill
          sizes="50vw"
          src={ENGAGEMENT_BAND_OVERLAY_SRC}
        />
      </OverlayLayer>
      {children}
    </StyledStrip>
  );
}
