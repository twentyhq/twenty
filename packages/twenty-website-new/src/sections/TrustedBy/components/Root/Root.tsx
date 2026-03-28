import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(16)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(16)};
  }
`;

interface RootProps {
  children: ReactNode;
}

export function Root({ children }: RootProps) {
  return (
    <StyledSection>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
