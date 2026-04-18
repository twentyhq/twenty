import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { Children, type ReactNode } from 'react';

const StyledSection = styled.section`
  width: 100%;
`;

const StyledTop = styled.div`
  background-color: ${theme.colors.secondary.background[5]};
  background-image: url('/images/shared/light-noise.webp');
  width: 100%;
`;

const StyledBottom = styled.div`
  width: 100%;
`;

const StyledInnerContainer = styled(Container)`
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const StyledTopInner = styled(StyledInnerContainer)`
  padding-top: ${theme.spacing(12)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: ${theme.spacing(16)};
  }
`;

const StyledBottomInner = styled(StyledInnerContainer)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(12)};
  padding-top: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(16)};
  }
`;

interface RootProps {
  children: ReactNode;
}

export function Root({ children }: RootProps) {
  const [separator, ...rest] = Children.toArray(children);
  return (
    <StyledSection aria-label="Trusted by leading organizations">
      <StyledTop>
        <StyledTopInner>{separator}</StyledTopInner>
      </StyledTop>
      <StyledBottom>
        <StyledBottomInner>{rest}</StyledBottomInner>
      </StyledBottom>
    </StyledSection>
  );
}
