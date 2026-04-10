import { FAQ_DATA, MENU_DATA } from '@/app/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import { ALL_CASE_STUDIES } from '@/app/case-studies/_constants';
import { Eyebrow, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Signoff } from '@/sections/Signoff/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies — Twenty',
  description:
    'See how teams use Twenty to build custom CRM workflows and drive real business results.',
};

const HERO_HEADING = [
  { text: 'See how teams build ', fontFamily: 'serif' as const },
  { text: 'with Twenty', fontFamily: 'sans' as const },
];

const HERO_BODY = {
  text: 'Real stories from real teams — how they shaped Twenty to fit their workflow and accelerated their growth.',
};

const SIGNOFF_HEADING = [
  { text: 'Ready to build ', fontFamily: 'serif' as const },
  { text: 'your own story?', fontFamily: 'sans' as const },
];

const SIGNOFF_BODY = {
  text: 'Join the teams that chose to own their CRM. Start building with Twenty today.',
};

export default async function CaseStudiesCatalogPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
        <Hero.Heading page={Pages.CaseStudies} segments={HERO_HEADING} />
        <Hero.Body page={Pages.CaseStudies} body={HERO_BODY} />
      </Hero.Root>

      <CaseStudyCatalog.Grid caseStudies={ALL_CASE_STUDIES} />

      <Signoff.Root
        backgroundColor={theme.colors.primary.background[100]}
        color={theme.colors.primary.text[100]}
      >
        <Signoff.Heading segments={SIGNOFF_HEADING} />
        <Signoff.Body body={SIGNOFF_BODY} />
        <Signoff.Cta>
          <LinkButton
            color="primary"
            href="https://app.twenty.com/welcome"
            label="Get started"
            type="anchor"
            variant="contained"
          />
          <TalkToUsButton
            color="primary"
            label="Talk to us"
            variant="outlined"
          />
        </Signoff.Cta>
      </Signoff.Root>

      <Faq.Root illustration={FAQ_DATA.illustration}>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary" heading={FAQ_DATA.eyebrow.heading} />
          <Faq.Heading segments={FAQ_DATA.heading} />
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label="Get started"
              type="anchor"
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label="Talk to us"
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </>
  );
}
