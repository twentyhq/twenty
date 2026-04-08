import { Container } from '@/design-system/components';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { FaqVisual } from '../FaqVisual/FaqVisual';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  background-color: ${theme.colors.secondary.background[100]};
  color: ${theme.colors.secondary.text[100]};
  isolation: isolate;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const IllustrationLayer = styled.div`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  padding-bottom: ${theme.spacing(30)};
  padding-left: ${theme.spacing(6)};
  padding-right: ${theme.spacing(6)};
  padding-top: ${theme.spacing(30)};
  position: relative;
  row-gap: ${theme.spacing(20)};
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

type RootProps = {
  children: ReactNode;
  illustration: IllustrationType;
};

export function Root({ children, illustration }: RootProps) {
  return (
    <StyledSection>
      <IllustrationLayer aria-hidden>
        <FaqVisual src={illustration.src} title={illustration.title} />
      </IllustrationLayer>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
