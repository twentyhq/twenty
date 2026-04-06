import type { TrustedByLogosType } from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const StyledLogo = styled.div`
  height: 32px;
  overflow: clip;
  flex-shrink: 0;
  position: relative;
  width: 64px;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.4s ease;

  &:hover {
    transform: scale(1.05) translateY(-2px);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 40px;
    width: 80px;
  }
`;

type LogoProps = TrustedByLogosType;

export function Logo({ fit = 'contain', src }: LogoProps) {
  return (
    <StyledLogo aria-hidden="true">
      <NextImage
        alt=""
        fill
        sizes="(min-width: 921px) 80px, 64px"
        src={src}
        unoptimized
        style={{ objectFit: fit, objectPosition: 'center' }}
      />
    </StyledLogo>
  );
}
