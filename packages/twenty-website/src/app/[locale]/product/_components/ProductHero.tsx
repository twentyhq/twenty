import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { AI_HERO_TABS } from '@/app/[locale]/product/ai-hero-tabs.data';
import { APP_PREVIEW_DATA } from '@/sections/AppPreview';
import { Heading, HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { TalkToUsButton } from '@/sections/ContactCal';
import { HeroVisualScroll } from '@/sections/Hero';

export function ProductHero() {
  const i18n = getServerI18n();

  return (
    <HeroVisualScroll
      aiBody={i18n._(
        msg`Ask questions, automate tasks, and get insights with AI that understands your data and helps you move faster every day, end to end across teams.`,
      )}
      aiHeading={
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">
              ...with AI that actually
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">helps you</HeadingPart>
            <HeadingPart fontFamily="sans">work faster</HeadingPart>
          </Trans>
        </Heading>
      }
      ctaHref="https://app.twenty.com/welcome"
      ctaLabel={i18n._(msg`Get started`)}
      introBody={i18n._(
        msg`Track relationships, manage pipelines, and take action quickly with an intuitive CRM that helps your team move faster from day one with confidence.`,
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
      introSecondaryCta={
        <TalkToUsButton
          color="secondary"
          label={msg`Talk to us`}
          variant="outlined"
        />
      }
      tabs={AI_HERO_TABS}
      visual={APP_PREVIEW_DATA.visual}
    />
  );
}
