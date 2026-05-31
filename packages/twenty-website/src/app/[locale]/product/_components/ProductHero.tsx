import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { APP_PREVIEW_DATA } from '@/app/[locale]/(home)/app-preview.data';
import { AI_HERO_TABS } from '@/app/[locale]/product/ai-hero-tabs.data';
import { Heading, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { HeroVisualScroll } from '@/sections/Hero';

export function ProductHero() {
  const i18n = getServerI18n();

  return (
    <HeroVisualScroll
      aiBody={i18n._(
        msg`Ask questions, automate tasks, and get insights. All powered by AI that understands your data.`,
      )}
      aiHeading={
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">AI that actually</HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">helps you</HeadingPart>
            <HeadingPart fontFamily="sans">work faster</HeadingPart>
          </Trans>
        </Heading>
      }
      ctaHref="https://app.twenty.com/welcome"
      ctaLabel={i18n._(msg`Get started`)}
      introBody={i18n._(
        msg`Track relationships, manage pipelines, and take action quickly with a CRM that feels intuitive from day one.`,
      )}
      introHeading={
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">A CRM for teams</HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">that</HeadingPart>
            <HeadingPart fontFamily="sans">move fast</HeadingPart>
          </Trans>
        </Heading>
      }
      tabs={AI_HERO_TABS}
      visual={APP_PREVIEW_DATA.visual}
    />
  );
}
