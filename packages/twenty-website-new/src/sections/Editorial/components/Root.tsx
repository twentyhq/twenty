import { Container, GuideCrosshair } from '@/design-system/components';
import { theme, type Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;

  &[data-has-crosshair] {
    position: relative;
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
`;

const Inner = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  width: 100%;
`;

const StyledContainer = styled(Container)`
  padding-bottom: ${theme.spacing(28)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(28)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

type EditorialCrosshair = {
  crossX: string;
  crossY: string;
  lineColor?: string;
};

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  color?: string;
  crosshair?: EditorialCrosshair;
  scheme?: Scheme;
};

export function Root({
  backgroundColor,
  children,
  color,
  crosshair,
  scheme,
}: RootProps) {
  return (
    <StyledSection
      data-has-crosshair={crosshair ? '' : undefined}
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor, color }}
    >
      {crosshair ? (
        <GuideCrosshair
          crossX={crosshair.crossX}
          crossY={crosshair.crossY}
          lineColor={crosshair.lineColor}
        />
      ) : null}
      <StyledContainer>
        <Inner>{children}</Inner>
      </StyledContainer>
    </StyledSection>
  );
}
