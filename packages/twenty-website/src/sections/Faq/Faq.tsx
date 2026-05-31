import {
  Container,
  Eyebrow,
  Heading,
  HeadingPart,
  LinkButton,
} from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { WebGlMount } from '@/lib/visual-runtime';
import { TalkToUsButton } from '@/sections/ContactCal';
import { FAQ_QUESTIONS } from '@/sections/Faq/faq.data';
import { FaqItems } from '@/sections/Faq/FaqItems';
import { FaqBackground } from '@/sections/Faq/visuals/Background';
import { theme } from '@/theme';
import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

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

export function Faq() {
  const i18n = getServerI18n();

  return (
    <StyledSection data-scheme="dark">
      <IllustrationLayer aria-hidden>
        <WebGlMount>
          <FaqBackground />
        </WebGlMount>
      </IllustrationLayer>
      <StyledContainer>
        <StyledIntro>
          <Eyebrow colorScheme="secondary">
            <HeadingPart fontFamily="sans">
              <Trans>Any Questions?</Trans>
            </HeadingPart>
          </Eyebrow>
          <Heading
            as="h2"
            className={faqHeadingClassName}
            size="lg"
            weight="light"
          >
            <Trans>
              <HeadingPart fontFamily="serif">
                Stop fighting custom.
              </HeadingPart>
              <br />
              <HeadingPart fontFamily="sans">
                Start building, with Twenty
              </HeadingPart>
            </Trans>
          </Heading>
          <StyledCta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </StyledCta>
        </StyledIntro>
        <FaqItems questions={FAQ_QUESTIONS} />
      </StyledContainer>
    </StyledSection>
  );
}
