import { Container } from '@/design-system/components';
import { WebGlMount } from '@/lib/visual-runtime';
import { HomeBackgroundHalftone } from '@/sections/Hero/visuals/components/HomeBackgroundHalftone';
import { theme, type Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  &[data-color-scheme='primary'] {
    --hero-body-color: ${theme.colors.primary.text[60]};
    color: ${theme.colors.primary.text[100]};
  }

  &[data-color-scheme='secondary'] {
    --hero-body-color: ${theme.colors.secondary.text[80]};
    color: ${theme.colors.secondary.text[100]};
  }

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

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  colorScheme?: 'primary' | 'secondary';
  scheme?: Scheme;
  showHomeBackground?: boolean;
};

export function Root({
  backgroundColor,
  children,
  colorScheme = 'primary',
  scheme,
  showHomeBackground = false,
}: RootProps) {
  return (
    <StyledSection
      data-color-scheme={scheme ? undefined : colorScheme}
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor }}
    >
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
