import { msg } from '@lingui/core/macro';
import { HeadingPart, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Editorial } from '@/app/[locale]/why-twenty/_components/Editorial';
import { Marquee } from '@/app/[locale]/why-twenty/_components/Marquee';
import { Hero } from '@/sections/Hero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { Signoff } from '@/sections/Signoff';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';

const crosshairLineColor = theme.colors.secondary.border[10];

const sectionCrosshairLeft = {
  crossX: '120px',
  crossY: '0px',
  lineColor: crosshairLineColor,
};

const sectionCrosshairRight = {
  crossX: 'calc(100% - 120px)',
  crossY: '0px',
  lineColor: crosshairLineColor,
};

export const generateMetadata = buildRouteMetadata('whyTwenty');

type WhyTwentyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function WhyTwentyPage({ params }: WhyTwentyPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      {/*
       * Above-the-fold hero scene. Preload kicks off the GLB fetch in
       * parallel with the JS chunk download, so the model is already in
       * the browser cache by the time Three.js asks for it.
       */}
      <link
        as="fetch"
        href="/illustrations/why-twenty/hero/hero.glb"
        rel="preload"
      />
      <Menu.Root
        backgroundColor={theme.colors.secondary.background[100]}
        scheme="secondary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="secondary" />
        <Menu.Nav scheme="secondary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="secondary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="secondary" />
      </Menu.Root>

      <Hero.Root scheme="dark">
        <Hero.Heading page={Pages.WhyTwenty} size="xl">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`The future of CRM is built,`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`not bought.`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body page={Pages.WhyTwenty}>
          {i18n._(
            msg`CRM was a database you filled on Fridays. AI turned it into the system that runs your go-to-market. To differentiate, you have to build what your competitors can't buy.`,
          )}
        </Hero.Body>
        <Hero.WhyTwentyVisual />
      </Hero.Root>

      <Editorial
        scheme="dark"
        crosshair={sectionCrosshairRight}
        eyebrowColorScheme="secondary"
        eyebrow={i18n._(msg`The shift`)}
        heading={
          <>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`CRM was a ledger.`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`AI turned it into an operating system.`)}
            </HeadingPart>
          </>
        }
        bodyLayout="two-column-left"
        bodyParagraphs={[
          i18n._(
            msg`For twenty years, CRM meant the same thing: a place to log calls, track deals, and pull reports on Friday. The real work happened in people's heads, in Slack threads, in hallway conversations. The CRM kept score. Nobody expected more from it.`,
          ),
          i18n._(
            msg`AI agents are starting to draft outreach, score leads, research accounts, write follow-ups, update deal stages. Every one of these actions reads from and writes to the CRM. The scoreboard became the playbook. The database became the brain.`,
          ),
        ]}
      />

      <Editorial
        scheme="dark"
        crosshair={sectionCrosshairLeft}
        introAlign="right"
        eyebrowColorScheme="secondary"
        eyebrow={i18n._(msg`What this means`)}
        heading={
          <>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Differentiation now`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`lives in the code you own.`)}
            </HeadingPart>
          </>
        }
        bodyLayout="two-column-right"
        bodyParagraphs={[
          i18n._(
            msg`You don't buy your deployment pipeline off the shelf. You don't rent your data warehouse from a vendor who decides the schema. You build it, you own it, you iterate on it every week. CRM is going the same way. The teams that treat it as infrastructure they own will compound an advantage every quarter.`,
          ),
          i18n._(
            msg`Tuesday your team learns that deals with a technical champion close 3x faster. Wednesday you add the field, wire up the scoring, adjust the workflow. By Thursday your agents are acting on it. That feedback loop is the edge. And it only works if the CRM is yours.`,
          ),
        ]}
      />

      <Editorial
        scheme="dark"
        crosshair={sectionCrosshairRight}
        eyebrowColorScheme="secondary"
        eyebrow={i18n._(msg`The opportunity`)}
        heading={
          <>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Build it in an afternoon.`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`AI made the gap that small.`)}
            </HeadingPart>
          </>
        }
        bodyLayout="two-column-left"
        bodyParagraphs={[
          i18n._(
            msg`A year ago, customizing your CRM meant hiring a Salesforce consultant, learning Apex, waiting months. The gap between "I want this" and "it's live" was measured in quarters and invoices. So people settled. They bent their process to fit the tool and called it adoption.`,
          ),
          i18n._(
            msg`Now a developer can describe what they want to Claude Code and have a working app in an afternoon. A custom object, a scoring workflow, a new view, an integration. The bottleneck isn't building anymore. It's whether your platform lets you.`,
          ),
        ]}
      />

      <Marquee
        scheme="dark"
        segments={[
          { fontFamily: 'serif', text: i18n._(msg`Same CRM`) },
          { fontFamily: 'sans', text: i18n._(msg`Same output`) },
          { fontFamily: 'serif', text: i18n._(msg`Same results`) },
        ]}
      />

      <Signoff.Root scheme="dark" page={Pages.WhyTwenty}>
        <Signoff.Heading page={Pages.WhyTwenty}>
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Build a CRM your competitors`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">{i18n._(msg`can't buy.`)}</HeadingPart>
        </Signoff.Heading>
        <Signoff.Body page={Pages.WhyTwenty}>
          {i18n._(msg`Open-source, AI-ready, and yours to shape.`)}
        </Signoff.Body>
        <Signoff.Cta>
          <LinkButton
            color="primary"
            href="https://app.twenty.com/welcome"
            label={i18n._(msg`Get started`)}
            variant="contained"
          />
        </Signoff.Cta>
      </Signoff.Root>
    </>
  );
}
