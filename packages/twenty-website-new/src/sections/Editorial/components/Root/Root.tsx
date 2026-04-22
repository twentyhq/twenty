import { Container, GuideCrosshair } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ReactNode } from 'react';

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;

  &[data-has-crosshair] {
    position: relative;
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
  backgroundColor: string;
  children: ReactNode;
  color: string;
  crosshair?: EditorialCrosshair;
  mutedColor: string;
};

export function Root({
  backgroundColor,
  children,
  color,
  crosshair,
  mutedColor,
}: RootProps) {
  const cssVariables = {
    '--editorial-body-color': mutedColor,
  } as CSSProperties;

  return (
    <StyledSection
      data-has-crosshair={crosshair ? '' : undefined}
      style={{
        ...cssVariables,
        backgroundColor,
        color,
      }}
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
