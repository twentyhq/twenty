import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

const OVERLAY_SRC_BY_TONE = {
  white: '/images/shared/engagement-band/halftone-on-white.png',
  gray: '/images/shared/engagement-band/halftone-on-gray.png',
} as const;

type StripTone = keyof typeof OVERLAY_SRC_BY_TONE;

const OverlayLayer = styled.div`
  bottom: 0;
  left: 50%;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    left: auto;
    width: clamp(252px, 24.5%, 332px);
  }
`;

const OverlayImageFrame = styled.div`
  inset: 0;
  position: absolute;

  @media (min-width: ${theme.breakpoints.md}px) {
    inset: ${theme.spacing(3)};
  }
`;

const overlayImageClassName = css`
  object-fit: cover;
  object-position: right center;
`;

const StyledStrip = styled.div`
  border-radius: 4px;
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
    padding-right: ${theme.spacing(12)};
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
  tone?: StripTone;
  variant: 'primary' | 'secondary';
};

export function Strip({
  children,
  desktopCopyMaxWidth,
  fillColor,
  tone = 'white',
  variant,
}: StripProps) {
  const style = {
    backgroundColor: fillColor,
    ...(desktopCopyMaxWidth
      ? { '--engagement-band-copy-max-width': desktopCopyMaxWidth }
      : {}),
  } as CSSProperties;

  return (
    <StyledStrip
      data-has-custom-copy-max-width={Boolean(desktopCopyMaxWidth)}
      data-variant={variant}
      style={style}
    >
      <OverlayLayer aria-hidden>
        <OverlayImageFrame>
          <NextImage
            alt=""
            className={overlayImageClassName}
            fill
            sizes={`(min-width: ${theme.breakpoints.md}px) 308px, 50vw`}
            src={OVERLAY_SRC_BY_TONE[tone]}
          />
        </OverlayImageFrame>
      </OverlayLayer>
      {children}
    </StyledStrip>
  );
}
