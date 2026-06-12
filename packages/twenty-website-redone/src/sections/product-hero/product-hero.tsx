import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';

import { AI_HERO_TABS } from './ai-hero-tabs';
import { HeroVisualScroll } from './hero-visual-scroll';

export function ProductHero() {
  const i18n = getServerI18n();

  return (
    <HeroVisualScroll
      aiBody={i18n._(
        msg`Ask questions, automate tasks, and get insights with AI that understands your data and helps you move faster every day, end to end across teams.`,
      )}
      aiHeading={i18n._(
        msg`...with AI that actually helps you *work faster*`,
      )}
      ctaHref={SITE_URLS.appWelcome}
      ctaLabel={i18n._(msg`Get started`)}
      introBody={i18n._(
        msg`Track relationships, manage pipelines, and take action quickly with an intuitive CRM that helps your team move faster from day one with confidence.`,
      )}
      introHeading={i18n._(msg`A CRM for teams that *move fast*`)}
      introSecondaryCta={
        <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
      }
      tabs={AI_HERO_TABS}
    />
  );
}
