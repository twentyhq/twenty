import { Container } from '@/design-system/components';
import { IllustrationMount } from '@/illustrations';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  background-image: url('/images/shared/light-noise.webp');
  min-width: 0;
  overflow: clip;
  padding-bottom: ${theme.spacing(6)};
  position: relative;
  width: 100%;
`;

const StyledBackground = styled.div`
  bottom: 0;
  left: -20%;
  overflow: clip;
  pointer-events: none;
  position: absolute;
  right: -20%;
  top: 0;
  z-index: 0;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  min-width: 0;
  position: relative;
  text-align: center;
  padding-top: ${theme.spacing(7.5)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  row-gap: ${theme.spacing(6)};
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-top: ${theme.spacing(12)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

type RootProps = {
  backgroundColor: string;
  children: ReactNode;
  showHomeBackground?: boolean;
};

export function Root({
  backgroundColor,
  children,
  showHomeBackground = false,
}: RootProps) {
  return (
    <StyledSection style={{ backgroundColor }}>
      {showHomeBackground ? (
        <StyledBackground>
          <IllustrationMount illustration="heroHomeBackground" />
        </StyledBackground>
      ) : null}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
