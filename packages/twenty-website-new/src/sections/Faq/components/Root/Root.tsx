import { Container } from '@/design-system/components';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledSection = styled.section`
  background-color: ${theme.colors.secondary.background[100]};
  color: ${theme.colors.secondary.text[100]};
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const IllustrationWrapper = styled.div`
  bottom: 0;
  left: 0;
  mix-blend-mode: difference;
  opacity: 0.7;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const IllustrationEmbed = styled.iframe`
  aspect-ratio: 1;
  border: none;
  height: 120%;
  width: 120%;
  position: absolute;
  right: 0;
  left: 25%;
  top: 30%;
  transform: translateY(-50%) rotate(-90deg);
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
      {/* <IllustrationWrapper aria-hidden>
        <IllustrationEmbed
          allow="clipboard-write; encrypted-media; gyroscope; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          src={illustration.src}
          title={illustration.title}
        />
      </IllustrationWrapper> */}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
