import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
import { Carousel } from './components/TestimonialsCarousel';
import { PartnerCarousel } from './components/TestimonialsPartnerCarousel';
import { MountedTestimonialsVisual } from './components/MountedTestimonialsVisual';
import { MountedTestimonialsPartnerVisual } from './components/MountedTestimonialsPartnerVisual';

const TESTIMONIALS_SHAPE_PATH =
  'M0 4a4 4 0 0 1 4-4h344.32c4.197 0 8.369.66 12.361 1.958l49.5 16.084A40 40 0 0 0 422.542 20h517.7c4.293 0 8.559-.691 12.633-2.047l47.785-15.906A40 40 0 0 1 1013.29 0H1356a4 4 0 0 1 4 4v16H0z';

function TestimonialsShape({ fillColor }: { fillColor: string }) {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height="20"
        viewBox="0 0 1360 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path d={TESTIMONIALS_SHAPE_PATH} fill={fillColor} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 19,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: fillColor,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
    </div>
  );
}

const StyledSection = styled.section`
  min-width: 0;
  overflow: hidden;
  position: relative;
  width: 100%;

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
`;

const BackgroundShape = styled.div`
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const StyledContainer = styled(Container)<{ $compactBottom: boolean }>`
  padding-bottom: ${({ $compactBottom }) =>
    $compactBottom ? theme.spacing(6) : theme.spacing(22)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(22)};
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(25)};
    padding-bottom: ${({ $compactBottom }) =>
      $compactBottom ? theme.spacing(8) : theme.spacing(25)};
  }
`;

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  color?: string;
  compactBottom?: boolean;
  scheme?: 'light' | 'muted' | 'dark';
  shapeFillColor?: string;
};

function Root({
  backgroundColor,
  children,
  color,
  compactBottom = false,
  scheme,
  shapeFillColor = theme.colors.primary.background[100],
}: RootProps) {
  return (
    <StyledSection
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor, color }}
    >
      <BackgroundShape>
        <TestimonialsShape fillColor={shapeFillColor} />
      </BackgroundShape>
      <StyledContainer $compactBottom={compactBottom}>
        {children}
      </StyledContainer>
    </StyledSection>
  );
}

export const Testimonials = {
  Carousel,
  HourglassVisual: MountedTestimonialsVisual,
  PartnerCarousel,
  PartnerVisual: MountedTestimonialsPartnerVisual,
  Root,
};
