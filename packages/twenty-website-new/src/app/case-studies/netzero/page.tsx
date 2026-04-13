import { FAQ_DATA, MENU_DATA } from '@/app/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import type { CaseStudyData } from '@/app/case-studies/_constants/types';
import { Eyebrow, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudy } from '@/sections/CaseStudy/components';
import { Faq } from '@/sections/Faq/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

const PLACEHOLDER_HERO = '/images/home/hero/avatars/katherine-adams.jpg';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title: 'A CRM that grows with you — NetZero & Twenty',
    description:
      'How NetZero uses Twenty across carbon credits, agricultural products, and franchised industrial systems with a modular CRM and a roadmap toward AI-assisted workflows.',
  },
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
  sections: [
    {
      type: 'text',
      eyebrow: 'NetZero',
      heading: [
        { text: 'The right ', fontFamily: 'serif' },
        { text: 'foundation', fontFamily: 'sans' },
      ],
      paragraphs: [
        'NetZero works with the agro-industry, serving clients from multinationals to smallholder farmers. They sell carbon credits, agricultural products, and franchised industrial systems — three different product lines across multiple countries and company sizes. When Olivier Reinaud, co-founder of NetZero, started looking at CRMs in late 2024, he was not chasing the most feature-rich platform. He wanted the right foundation.',
      ],
      callout:
        '"Twenty delivers on what CRMs should have always been: fairly priced software with a fully modular and customizable model, a clean and modern UI, granular permissions, automations, enterprise features. A compelling solution with high potential to rightfully disrupt the CRM market." — Olivier Reinaud, co-founder of NetZero',
    },
    {
      type: 'text',
      eyebrow: 'Flexibility',
      heading: [
        { text: 'A business that ', fontFamily: 'serif' },
        { text: 'does not fit a template', fontFamily: 'sans' },
      ],
      paragraphs: [
        'What convinced Olivier was the flexibility of the platform and where it was headed. Even when initial needs were basic record-keeping, he still needed a custom data model with granular permissions to manage the wide range of NetZero activities. He also needed a system that could adapt quickly to a fast-iteration company.',
        'With Twenty, when a new need appears, he can address it himself — no developer required, no support ticket.',
      ],
      callout:
        '"The flexibility is really what made the difference. Our needs evolve very fast. I discover a new need and in two clicks I can address it. That is a real advantage when you are moving quickly." — Olivier Reinaud, co-founder of NetZero',
    },
    {
      type: 'text',
      eyebrow: 'Roadmap',
      heading: [
        { text: 'From simple ', fontFamily: 'serif' },
        { text: 'to advanced', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Olivier recognizes that NetZero\'s current use of Twenty is still relatively simple: workflows and integrations are not yet as deep as he eventually wants, because he prioritized getting foundations right first.',
        'What is planned is significant. NetZero has a data lake, online forms, and multiple internal systems that he wants to connect to Twenty. The pipes are there; the next step is automations that tie them together.',
        'What is coming in April 2026 is what he has been waiting for: AI-assisted workflow creation — describing what he needs and iterating from there instead of building complex logic from scratch. For a founder who runs the CRM himself, that changes what is realistically possible.',
      ],
    },
    {
      type: 'text',
      eyebrow: 'Results',
      heading: [
        { text: 'The bet ', fontFamily: 'serif' },
        { text: 'is paying off', fontFamily: 'sans' },
      ],
      paragraphs: [
        'While NetZero still runs a second CRM in parallel for WhatsApp-heavy operations with farmers in Brazil, they expect to migrate all of it to Twenty as features and the ecosystem grow. Already, their structured, multinational pipeline is powered by Twenty.',
        'The early bet on the architecture is holding, and upcoming AI features are expected to make it even more relevant.',
      ],
    },
  ],
  testimonial: {
    eyebrow: 'What they say',
    quote:
      'The flexibility is really what made the difference. Our needs evolve very fast. I discover a new need and in two clicks I can address it.',
    author: {
      name: 'Olivier Reinaud',
      handle: 'Co-founder, NetZero',
      date: '2025',
      avatarSrc: PLACEHOLDER_HERO,
    },
  },
  tableOfContents: [
    'The right foundation',
    'A business that does not fit a template',
    'From simple to advanced',
    'The bet is paying off',
  ],
  catalogCard: {
    summary:
      'NetZero uses Twenty as a modular CRM across product lines and countries, with a roadmap into AI-assisted workflows.',
    date: '2025',
  },
};

export const metadata: Metadata = {
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
};

export default async function NetZeroCaseStudyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
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

      <CaseStudy.Hero hero={CASE_STUDY.hero} />

      {CASE_STUDY.sections.map((block, index) => {
        if (block.type === 'text') {
          return <CaseStudy.TextBlock key={index} block={block} />;
        }
        return <CaseStudy.VisualBlock key={index} block={block} />;
      })}

      <CaseStudy.Testimonial testimonial={CASE_STUDY.testimonial} />

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

      <CaseStudy.TableOfContents items={CASE_STUDY.tableOfContents} />
    </>
  );
}
