import { Container, LazyEmbed } from '@/design-system/components';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
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
  opacity: 0.45;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const FaqIllustrationEmbed = styled(LazyEmbed)`
  border: none;
  top: -15%;
  right: -5%;
  left: auto;
  transform: none;
  display: block;
  height: min(60vh, 550px);
  position: absolute;
  width: min(70vw, 750px);

  @media (min-width: ${theme.breakpoints.md}px) {
    top: -20%;
    right: -10%;
    height: min(70vh, 700px);
    width: min(60vw, 900px);
  }
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
        <FaqIllustrationEmbed
          allow="clipboard-write; encrypted-media; gyroscope; web-share"
          allowFullScreen
          eager
          referrerPolicy="strict-origin-when-cross-origin"
          rootMargin="400px 0px"
          src={illustration.src}
          title={illustration.title}
        />
      </IllustrationLayer>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
