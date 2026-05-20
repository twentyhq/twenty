import { msg } from '@lingui/core/macro';
import { HeadingPart, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Editorial } from '@/sections/Editorial';
import { Hero } from '@/sections/Hero';
import { Marquee } from '@/sections/Marquee';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { Signoff } from '@/sections/Signoff';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { css } from '@linaria/core';

const editorialOneIntroClass = css`
  margin-bottom: ${theme.spacing(4)};
  --editorial-heading-max-width: 760px;
  --editorial-intro-max-width: 760px;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-bottom: ${theme.spacing(8)};
  }
`;

const editorialRightIntroClass = css`
  margin-bottom: ${theme.spacing(4)};
  --editorial-heading-max-width: 760px;
  --editorial-intro-max-width: 760px;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: flex-end;
    margin-bottom: ${theme.spacing(8)};
    margin-left: auto;
    margin-right: 0;
    text-align: right;
    width: auto;
  }
`;

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

      <Editorial.Root scheme="dark" crosshair={sectionCrosshairRight}>
        <Editorial.Intro className={editorialOneIntroClass}>
          <Editorial.Eyebrow colorScheme="secondary">
            {i18n._(msg`The shift`)}
          </Editorial.Eyebrow>
          <Editorial.Heading>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`CRM was a ledger.`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`AI turned it into an operating system.`)}
            </HeadingPart>
          </Editorial.Heading>
        </Editorial.Intro>
        <Editorial.Body layout="two-column-left">
          {i18n._(
            msg`For twenty years, CRM meant the same thing: a place to log calls, track deals, and pull reports on Friday. The real work happened in people's heads, in Slack threads, in hallway conversations. The CRM kept score. Nobody expected more from it.`,
          )}
          {i18n._(
            msg`AI agents are starting to draft outreach, score leads, research accounts, write follow-ups, update deal stages. Every one of these actions reads from and writes to the CRM. The scoreboard became the playbook. The database became the brain.`,
          )}
        </Editorial.Body>
      </Editorial.Root>

      <Editorial.Root scheme="dark" crosshair={sectionCrosshairLeft}>
        <Editorial.Intro className={editorialRightIntroClass}>
          <Editorial.Eyebrow colorScheme="secondary">
            {i18n._(msg`What this means`)}
          </Editorial.Eyebrow>
          <Editorial.Heading>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Differentiation now`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`lives in the code you own.`)}
            </HeadingPart>
          </Editorial.Heading>
        </Editorial.Intro>
        <Editorial.Body layout="two-column-right">
          {i18n._(
            msg`You don't buy your deployment pipeline off the shelf. You don't rent your data warehouse from a vendor who decides the schema. You build it, you own it, you iterate on it every week. CRM is going the same way. The teams that treat it as infrastructure they own will compound an advantage every quarter.`,
          )}
          {i18n._(
            msg`Tuesday your team learns that deals with a technical champion close 3x faster. Wednesday you add the field, wire up the scoring, adjust the workflow. By Thursday your agents are acting on it. That feedback loop is the edge. And it only works if the CRM is yours.`,
          )}
        </Editorial.Body>
      </Editorial.Root>

      <Editorial.Root scheme="dark" crosshair={sectionCrosshairRight}>
        <Editorial.Intro className={editorialOneIntroClass}>
          <Editorial.Eyebrow colorScheme="secondary">
            {i18n._(msg`The opportunity`)}
          </Editorial.Eyebrow>
          <Editorial.Heading>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Build it in an afternoon.`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`AI made the gap that small.`)}
            </HeadingPart>
          </Editorial.Heading>
        </Editorial.Intro>
        <Editorial.Body layout="two-column-left">
          {i18n._(
            msg`A year ago, customizing your CRM meant hiring a Salesforce consultant, learning Apex, waiting months. The gap between "I want this" and "it's live" was measured in quarters and invoices. So people settled. They bent their process to fit the tool and called it adoption.`,
          )}
          {i18n._(
            msg`Now a developer can describe what they want to Claude Code and have a working app in an afternoon. A custom object, a scoring workflow, a new view, an integration. The bottleneck isn't building anymore. It's whether your platform lets you.`,
          )}
        </Editorial.Body>
      </Editorial.Root>

      <Marquee.Root
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
