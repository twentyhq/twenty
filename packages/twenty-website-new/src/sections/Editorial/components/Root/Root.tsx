import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ReactNode } from 'react';

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;
`;

const Inner = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  width: 100%;

  /* Smooth transition for the children elements */
  & > * {
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* When hovering over any direct child, aggressively shrink and dim the other */
  &:has(> div:hover) > div:not(:hover) {
    opacity: 0.1;
    transform: scale(0.95) translateY(12px);
  }

  /* Expand the hovered element */
  &:has(> div:hover) > div:hover {
    transform: scale(1.02);
    z-index: 2;
  }
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

type RootProps = {
  backgroundColor: string;
  children: ReactNode;
  color: string;
  mutedColor: string;
};

export function Root({
  backgroundColor,
  children,
  color,
  mutedColor,
}: RootProps) {
  const cssVariables = {
    '--editorial-body-color': mutedColor,
  } as CSSProperties;

  return (
    <StyledSection
      style={{
        ...cssVariables,
        backgroundColor,
        color,
      }}
    >
      <StyledContainer>
        <Inner>{children}</Inner>
      </StyledContainer>
    </StyledSection>
  );
}
