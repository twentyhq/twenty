import { APP_PREVIEW_DATA } from '@/app/[locale]/(home)/app-preview.data';
import {
  Container,
  Eyebrow,
  Heading,
  HeadingPart,
  LinkButton,
} from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { AppPreview } from '@/sections/AppPreview';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import NextImage from 'next/image';

const RootWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
  width: 100%;
`;

const BackgroundLayer = styled.div`
  align-self: stretch;
  grid-column: 1;
  grid-row: 1;
  opacity: 0.6;
  pointer-events: none;
  position: relative;
  width: 100%;
  z-index: 0;
`;

const PatternLayer = styled.div`
  bottom: 0;
  height: 60%;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 100%;
`;

const patternImageClassName = css`
  object-fit: cover;
  object-position: center top;
`;

const StyledSection = styled.section`
  grid-column: 1;
  grid-row: 1;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  padding-bottom: ${theme.spacing(16)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(16)};
  row-gap: ${theme.spacing(6)};
  text-align: center;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(24)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(24)};
  }
`;

const CtasContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(4)};
  justify-content: center;
`;

const PreviewRoot = styled.div`
  margin-bottom: ${theme.spacing(11)};
  margin-top: ${theme.spacing(12)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: ${theme.spacing(19)};
  }
`;

export function ProductDemo() {
  const i18n = getServerI18n();

  return (
    <RootWrapper>
      <BackgroundLayer aria-hidden>
        <PatternLayer>
          <NextImage
            alt=""
            className={patternImageClassName}
            fill
            sizes="(min-width: 921px) 100vw"
            src="/images/product/demo/background.webp"
          />
        </PatternLayer>
      </BackgroundLayer>
      <StyledSection>
        <StyledContainer>
          <Eyebrow>
            <HeadingPart fontFamily="sans">
              <Trans>Try it live</Trans>
            </HeadingPart>
          </Eyebrow>
          <Heading size="lg" weight="light">
            <Trans>
              <HeadingPart fontFamily="serif">A demo worth a</HeadingPart>
              <br />
              <HeadingPart fontFamily="sans">thousand words</HeadingPart>
            </Trans>
          </Heading>
          <CtasContainer>
            <LinkButton
              color="secondary"
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Try Twenty Cloud`)}
              variant="contained"
            />
          </CtasContainer>
          <PreviewRoot>
            <AppPreview showTerminal={false} visual={APP_PREVIEW_DATA.visual} />
          </PreviewRoot>
        </StyledContainer>
      </StyledSection>
    </RootWrapper>
  );
}
