import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { AppPreview } from '@/app-preview/AppPreview';
import { type AppPreviewConfig } from '@/app-preview/types';
import { TalkToUsButton } from '@/contact-cal';
import { type ResolvedIndustryPage } from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { HERO_COMPOSITION, spacing } from '@/tokens';
import {
  Body,
  Button,
  Eyebrow,
  Heading,
  HeadingPair,
  SectionShell,
} from '@/ui';

const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const HeadingMeasure = styled.div`
  max-width: 672px;
  width: 100%;
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 591px;
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

// Same life-size stage as the homepage hero: the window never shrinks,
// the viewport crops it.
const MockupStage = styled.div`
  height: ${APP_PREVIEW_STAGE.windowScene.heightPx}px;
  margin-left: max(
    0px,
    calc((100% - ${APP_PREVIEW_STAGE.windowScene.widthPx}px) / 2)
  );
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  position: relative;
  width: ${APP_PREVIEW_STAGE.windowScene.widthPx}px;
`;

type IndustryHeroProps = {
  page: ResolvedIndustryPage;
  previewConfig: AppPreviewConfig;
};

export function IndustryHero({ page, previewConfig }: IndustryHeroProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="hero" scheme="muted">
      <IntroStack>
        <Eyebrow>{i18n._(page.name)}</Eyebrow>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(page.hero.headline)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(page.hero.body)}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>
          <Button
            href={SITE_URLS.appWelcome}
            label={i18n._(msg`Start building`)}
          />
          <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
        </CtaRow>
      </IntroStack>
      <MockupStage>
        <AppPreview config={previewConfig} mode="static" />
      </MockupStage>
    </SectionShell>
  );
}
