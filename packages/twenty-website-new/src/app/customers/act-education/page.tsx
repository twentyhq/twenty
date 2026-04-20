import { MENU_DATA } from '@/app/_constants';
import { CustomersCaseStudySignoff } from '@/app/customers/_components/CustomersCaseStudySignoff';
import { getCaseStudyPalette } from '@/app/customers/_constants';
import type { CaseStudyData } from '@/app/customers/_constants/types';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudy } from '@/sections/CaseStudy/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

const PLACEHOLDER_HERO =
  'https://images.unsplash.com/photo-1687600154329-150952c73169?w=1600&q=80';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title:
      'Burned by vendor lock-in, AC&T built a CRM they actually own | Twenty',
    description:
      'How AC&T Education Migration and Flycoder replaced a shuttered vendor CRM with self-hosted Twenty, with 90%+ lower cost and full ownership.',
  },
  hero: {
    readingTime: '7 min',
    title: [
      { text: 'A CRM they ', fontFamily: 'serif' },
      { text: 'actually own', fontFamily: 'sans', newLine: true },
    ],
    author: 'Joseph Chiang',
    authorAvatarSrc: '/images/partner/testimonials/joseph-chiang.jpg',
    authorRole: 'CRM Engineer, AC&T Education Migration',
    clientIcon: 'act-education',
    heroImageSrc: PLACEHOLDER_HERO,
    industry: 'Education',
    kpis: [{ value: '90%+', label: 'Lower CRM cost' }],
  },
  sections: [
    {
      type: 'text',
      eyebrow: 'AC&T Education Migration',
      heading: [
        { text: 'When the vendor ', fontFamily: 'serif' },
        { text: 'pulled the plug', fontFamily: 'sans' },
      ],
      paragraphs: [
        'AC&T Education Migration (actimmi.com) is an education agency in Australia. They help international students with applications to education providers and visas. They had been on a previous CRM until the vendor shut the system down, leaving nothing but a CSV export.',
        'Whatever came next had to be something they could own.',
      ],
      callout:
        '"They did not want to learn someone else\'s system. They wanted to keep working the way they already did and make it smoother." - Joseph Chiang, CRM Engineer, AC&T Education Migration',
    },
    {
      type: 'text',
      eyebrow: 'Implementation',
      heading: [
        { text: "No more renting someone else's ", fontFamily: 'serif' },
        { text: 'structure', fontFamily: 'sans' },
      ],
      paragraphs: [
        'They evaluated Salesforce, Zoho, Pipedrive, and SuiteCRM. Each came with the same tradeoffs: too expensive, too rigid, or too generic, and none fixed the underlying problem. They were still renting a structure they did not control.',
        'Flycoder, a full-stack development partner, helped them set up Twenty as a self-hosted instance shaped around how AC&T actually operates. The data model centers on students, not a generic contact-and-deal pipeline. Statuses update automatically: a workflow runs nightly to keep enrollment records current. Automated email reminders cover important dates. Adding a new record takes under a minute.',
        'The result is a system that fits how AC&T already worked, instead of the other way around.',
      ],
    },
    {
      type: 'text',
      eyebrow: 'Control',
      heading: [
        { text: 'Control without ', fontFamily: 'serif' },
        { text: 'the overhead', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Self-hosted means AC&T carries no vendor risk: no pricing model that can change, no platform that can disappear, no forced migration. The system is theirs.',
        "Because everything is built on Twenty's open foundation, Flycoder could wire the exact logic AC&T needed without fighting the platform.",
      ],
    },
    {
      type: 'text',
      eyebrow: 'The result',
      heading: [
        { text: 'Costs down more than ', fontFamily: 'serif' },
        { text: '90%', fontFamily: 'sans' },
      ],
      paragraphs: [
        'CRM costs dropped by more than 90%. Manual overhead tied to the old system is gone. For the first time, AC&T has a CRM they will not lose again.',
        'They did not just replace a tool. They took back ownership of how their business runs.',
      ],
    },
  ],
  tableOfContents: [
    'When the vendor pulled the plug',
    "No more renting someone else's structure",
    'Control without the overhead',
    'The result',
  ],
  catalogCard: {
    summary:
      'AC&T and Flycoder moved from a dead vendor export to self-hosted Twenty, with over 90% lower CRM cost and full control.',
    date: '2025',
  },
};

export const metadata: Metadata = {
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
};

export default async function ActEducationCaseStudyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const palette = getCaseStudyPalette('/customers/act-education');

  let storySectionIndex = 0;
  const sectionBlocks = CASE_STUDY.sections.map((block, index) => {
    if (block.type === 'text') {
      const sectionId = `case-study-section-${storySectionIndex}`;
      storySectionIndex += 1;
      return (
        <CaseStudy.TextBlock
          key={index}
          block={block}
          isLast={index === CASE_STUDY.sections.length - 1}
          sectionId={sectionId}
        />
      );
    }
    return (
      <CaseStudy.VisualBlock
        key={index}
        block={block}
        isLast={index === CASE_STUDY.sections.length - 1}
      />
    );
  });

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

      <CaseStudy.Hero
        dashColor={palette.dashColor}
        hero={CASE_STUDY.hero}
        hoverDashColor={palette.hoverDashColor}
      />

      <CaseStudy.Highlights
        industry={CASE_STUDY.hero.industry}
        kpis={CASE_STUDY.hero.kpis}
      />

      <CaseStudy.Body>{sectionBlocks}</CaseStudy.Body>

      <CaseStudy.SectionNav items={CASE_STUDY.tableOfContents} />
      <CustomersCaseStudySignoff />
    </>
  );
}
