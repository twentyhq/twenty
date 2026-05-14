import { Container, Heading as BaseHeading } from '@/design-system/components';
import { WebGlMount } from '@/lib/visual-runtime';
import { FaqBackground } from '@/sections/Faq/visuals/Background';
import { FaqItems } from '@/sections/Faq/FaqItems';
import { theme } from '@/theme';
import { css } from '@linaria/core';
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

const StyledIntro = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(6)};
`;

const faqHeadingClassName = css`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 700px;
  }
`;

const StyledCta = styled.div`
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-template-columns: auto auto;
  justify-content: start;
`;

type ChildrenProps = {
  children: ReactNode;
};

function Root({ children }: ChildrenProps) {
  return (
    <StyledSection data-scheme="dark">
      <IllustrationLayer aria-hidden>
        <WebGlMount>
          <FaqBackground />
        </WebGlMount>
      </IllustrationLayer>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}

function Intro({ children }: ChildrenProps) {
  return <StyledIntro>{children}</StyledIntro>;
}

function Heading({ children }: ChildrenProps) {
  return (
    <BaseHeading
      as="h2"
      className={faqHeadingClassName}
      size="lg"
      weight="light"
    >
      {children}
    </BaseHeading>
  );
}

function Cta({ children }: ChildrenProps) {
  return <StyledCta>{children}</StyledCta>;
}

export const Faq = {
  Cta,
  Heading,
  Intro,
  Items: FaqItems,
  Root,
};
