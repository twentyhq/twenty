import { Container } from '@/design-system/components';
import { IllustrationMount } from '@/illustrations';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  &[data-color-scheme='primary'] {
    --hero-body-color: ${theme.colors.primary.text[60]};
    color: ${theme.colors.primary.text[100]};
  }

  &[data-color-scheme='secondary'] {
    --hero-body-color: ${theme.colors.secondary.text[80]};
    color: ${theme.colors.secondary.text[100]};
  }

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
  colorScheme?: 'primary' | 'secondary';
  showHomeBackground?: boolean;
};

export function Root({
  backgroundColor,
  children,
  colorScheme = 'primary',
  showHomeBackground = false,
}: RootProps) {
  return (
    <StyledSection data-color-scheme={colorScheme} style={{ backgroundColor }}>
      {showHomeBackground ? (
        <StyledBackground>
          <IllustrationMount illustration="heroHomeBackground" />
        </StyledBackground>
      ) : null}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
