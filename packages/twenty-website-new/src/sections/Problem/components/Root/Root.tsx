import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(12)};
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};

  /* Smooth transition for the children elements */
  & > * {
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* When hovering one column, aggressively push the other one down and fade it out */
  &:has(> div:hover) > div:not(:hover) {
    opacity: 0.1;
    transform: translateY(24px) scale(0.95);
  }

  /* Scale up the hovered column slightly */
  &:has(> div:hover) > div:hover {
    transform: scale(1.02);
    z-index: 2;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${theme.spacing(4)};
    grid-template-columns: 1fr 1fr;
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(10)};
    padding-bottom: ${theme.spacing(10)};
    row-gap: ${theme.spacing(20)};
  }
`;

type RootProps = { children: ReactNode };

export function Root({ children }: RootProps) {
  return (
    <StyledSection>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
