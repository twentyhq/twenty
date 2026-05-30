import { Container } from '@/design-system/components';
import { WebGlMount } from '@/lib/visual-runtime';
import { HomeBackgroundHalftone } from '@/sections/Hero/visuals/components/HomeBackgroundHalftone';
import { theme, type Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  &[data-scheme='light'] {
    background-color: var(--color-white);
    color: var(--color-text);
  }

  &[data-scheme='muted'] {
    background-color: var(--color-neutral);
    color: var(--color-text);
  }

  &[data-scheme='dark'] {
    background-color: var(--color-black);
    color: var(--color-text);
  }

  min-width: 0;
  overflow: clip;
  padding-bottom: ${theme.spacing(6)};
  position: relative;
  width: 100%;
`;

const StyledBackground = styled.div`
  background: radial-gradient(
    ellipse 80% 60% at 50% 40%,
    rgba(245, 243, 240, 0.6) 0%,
    transparent 70%
  );
  bottom: 0;
  left: -20%;
  overflow: clip;
  pointer-events: none;
  position: absolute;
  right: -20%;
  top: 0;
  z-index: 0;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  min-width: 0;
  position: relative;
  text-align: center;
  padding-top: ${theme.spacing(7.5)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  row-gap: ${theme.spacing(6)};
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: ${theme.spacing(12)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

type HeroSectionProps = {
  children: ReactNode;
  scheme: Scheme;
  // Renders the home page's halftone background behind the hero content.
  showHomeBackground?: boolean;
};

// Shared hero shell: the scheme-aware section background and the centered
// content container. Heroes compose their own heading/body/cta/visual inside.
export function HeroSection({
  children,
  scheme,
  showHomeBackground = false,
}: HeroSectionProps) {
  return (
    <StyledSection data-scheme={scheme}>
      {showHomeBackground ? (
        <StyledBackground>
          <WebGlMount priority>
            <HomeBackgroundHalftone />
          </WebGlMount>
        </StyledBackground>
      ) : null}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
