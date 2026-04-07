import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ReactNode } from 'react';
import { Decoration } from '../Decoration/Decoration';

const StyledSection = styled.section`
  min-width: 0;
  overflow: visible;
  position: relative;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: grid;
  justify-items: center;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: ${theme.spacing(28)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(28)};
  position: relative;

  /* Smooth transition for the children elements */
  & > * {
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* When hovering over the heading, massively spin the decoration and push it up */
  &:has(div:hover) > div:not(:hover) {
    opacity: 0.1;
    transform: scale(1.5) rotate(90deg) translateY(-20px);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

type RootProps = {
  backgroundColor: string;
  children: ReactNode;
  color: string;
};

export function Root({ backgroundColor, children, color }: RootProps) {
  const cssVariables = {
    '--statement-emphasis': color,
    '--statement-line':
      'color-mix(in srgb, var(--statement-emphasis) 40%, transparent)',
  } as CSSProperties;

  return (
    <StyledSection style={{ ...cssVariables, backgroundColor, color }}>
      <StyledContainer>
        <Decoration />
        {children}
      </StyledContainer>
    </StyledSection>
  );
}
