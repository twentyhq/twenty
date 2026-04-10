import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  padding-bottom: ${theme.spacing(20)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(28)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const EmptyMessage = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4)};
  line-height: 1.65;
  margin: 0;
  max-width: 40rem;

  strong {
    color: ${theme.colors.primary.text[80]};
    font-family: ${theme.font.family.mono};
    font-size: ${theme.font.size(3)};
    font-weight: ${theme.font.weight.medium};
  }
`;

type RootProps = {
  children: ReactNode;
};

export function Root({ children }: RootProps) {
  return (
    <StyledSection aria-label="Release notes">
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}

export { EmptyMessage };
