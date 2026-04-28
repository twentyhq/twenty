import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

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
  return (
    <StyledSection style={{ backgroundColor, color }}>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
