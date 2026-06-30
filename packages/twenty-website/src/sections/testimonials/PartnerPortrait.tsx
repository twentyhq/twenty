import { styled } from '@linaria/react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

import { PARTNER_PORTRAIT_SETTINGS } from './partner-portrait-config';

const PortraitMount = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

// The portrait is meaningful (the author), so it carries the image role/label;
// the halftone canvas inside is decorative. The image URL changes per author,
// which re-creates the session — the same reload the old site did on navigate.
export function PartnerPortrait({ alt, src }: { alt: string; src: string }) {
  return (
    <PortraitMount
      aria-label={alt}
      data-illustration="partner-portrait"
      role="img"
    >
      <HalftoneImageBackdrop
        imageUrl={src}
        settings={PARTNER_PORTRAIT_SETTINGS}
      />
    </PortraitMount>
  );
}
