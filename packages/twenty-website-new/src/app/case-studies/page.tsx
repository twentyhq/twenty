import { MENU_DATA } from '@/app/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import type { CaseStudyCatalogEntry } from '@/app/case-studies/_constants/types';
import { LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog/components';
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

const PLACEHOLDER_HERO = '/images/shared/people/avatars/katherine-adams.jpg';

const CASE_STUDY_CATALOG_ENTRIES: CaseStudyCatalogEntry[] = [
  {
    href: '/case-studies/elevate-consulting',
    hero: {
      readingTime: '8 min',
      title: [
        { text: 'Twenty as the API backbone ', fontFamily: 'serif' },
        { text: 'of a go-to-market stack', fontFamily: 'sans' },
      ],
      author: 'Justin Beadle',
      clientIcon: 'elevate-consulting',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'Elevate Consulting uses Twenty as the API backbone connecting billing, Teams, resourcing, and a custom front end around client and opportunity data.',
      date: 'Jun 2025',
    },
  },
  {
    href: '/case-studies/9dots',
    hero: {
      readingTime: '9 min',
      title: [
        { text: 'A real estate agency on WhatsApp ', fontFamily: 'serif' },
        { text: 'built a CRM around it', fontFamily: 'sans' },
      ],
      author: 'Mike Babiy & Azmat Parveen',
      clientIcon: 'nine-dots',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        "Nine Dots put Twenty at the center of Homeseller's stack with APIs, automation, and AI on top of WhatsApp-heavy operations.",
      date: 'Jul 2025',
    },
  },
  {
    href: '/case-studies/alternative-partners',
    hero: {
      readingTime: '7 min',
      title: [
        { text: 'From Salesforce to ', fontFamily: 'serif' },
        { text: 'self-hosted Twenty', fontFamily: 'sans' },
      ],
      author: 'Benjamin Reynolds',
      clientIcon: 'alternative-partners',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'Alternative Partners replaced Salesforce with self-hosted Twenty, using agentic AI to compress migration work.',
      date: '2025',
    },
  },
  {
    href: '/case-studies/netzero',
    hero: {
      readingTime: '8 min',
      title: [
        { text: 'A CRM that ', fontFamily: 'serif' },
        { text: 'grows with you', fontFamily: 'sans' },
      ],
      author: 'Olivier Reinaud',
      clientIcon: 'netzero',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'NetZero uses Twenty as a modular CRM across product lines and countries, with a roadmap into AI-assisted workflows.',
      date: '2025',
    },
  },
  {
    href: '/case-studies/act-education',
    hero: {
      readingTime: '7 min',
      title: [
        { text: 'A CRM they ', fontFamily: 'serif' },
        { text: 'actually own', fontFamily: 'sans' },
      ],
      author: 'Joseph Chiang',
      clientIcon: 'act-education',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'AC&T and Flycoder moved from a dead vendor export to self-hosted Twenty — over 90% lower CRM cost and full control.',
      date: '2025',
    },
  },
  {
    href: '/case-studies/w3villa',
    hero: {
      readingTime: '8 min',
      title: [
        { text: 'When your CRM ', fontFamily: 'serif' },
        { text: 'is the product', fontFamily: 'sans' },
      ],
      author: 'Amrendra Pratap Singh',
      clientIcon: 'w3villa',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'W3villa shipped W3Grads on Twenty — AI interviews, scoring, and institution-scale workflows without rebuilding CRM plumbing.',
      date: '2025',
    },
  },
];

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

      <CaseStudyCatalog.Grid entries={CASE_STUDY_CATALOG_ENTRIES} />

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
    </>
  );
}
