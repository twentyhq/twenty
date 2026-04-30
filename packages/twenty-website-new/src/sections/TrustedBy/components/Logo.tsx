import type { TrustedByLogosType } from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const StyledLogo = styled.div`
  height: 28px;
  flex-shrink: 0;
  overflow: clip;
  position: relative;
  width: 56px;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 32px;
    width: 64px;
  }
`;

type LogoProps = TrustedByLogosType;

const DEFAULT_GRAY_BRIGHTNESS = 1;
const DEFAULT_GRAY_OPACITY = 0.72;

export function Logo({
  fit = 'contain',
  grayBrightness = DEFAULT_GRAY_BRIGHTNESS,
  grayOpacity = DEFAULT_GRAY_OPACITY,
  src,
}: LogoProps) {
  return (
    <StyledLogo aria-hidden="true">
      <NextImage
        alt=""
        fill
        sizes="(min-width: 921px) 80px, 64px"
        src={src}
        unoptimized
        style={{
          filter: `grayscale(1) brightness(${grayBrightness})`,
          objectFit: fit,
          objectPosition: 'center',
          opacity: grayOpacity,
        }}
      />
    </StyledLogo>
  );
}
