import { MENU_DATA } from '@/app/_constants';
import type { CaseStudyData } from '@/app/case-studies/_constants/types';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudy } from '@/sections/CaseStudy/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

const PLACEHOLDER_HERO = '/images/shared/people/avatars/katherine-adams.jpg';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title:
      'From Salesforce to self-hosted Twenty, powered by AI — Alternative Partners',
    description:
      'How Alternative Partners migrated from Salesforce to self-hosted Twenty using agentic AI in the implementation loop — fast migration, durable ownership.',
  },
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
  sections: [
    {
      type: 'text',
      eyebrow: 'Alternative Partners',
      heading: [
        { text: 'AI in the ', fontFamily: 'serif' },
        { text: 'migration workflow', fontFamily: 'sans' },
      ],
      paragraphs: [
        "Alternative Partners is a consulting firm that moved from Salesforce to a self-hosted Twenty instance. Benjamin Reynolds led the migration — he had already become a Twenty expert implementing Twenty for one of Twenty's first cloud customers.",
        'His approach was unconventional. Instead of mapping fields manually, scripting transforms, and validating data step by step, he handed the job to agentic AI tools with a brief: where the data lives, the GitHub repo for the target platform, the Railway deployment — start, and only return if something breaks beyond a 70% confidence fix.',
        'It worked. This is AI-assisted iteration in practice: not AI as a product feature, but as part of implementation work, compressing what would typically be weeks into something one person can oversee without being the bottleneck.',
      ],
    },
    {
      type: 'text',
      eyebrow: 'Ownership',
      heading: [
        { text: 'Self-hosted ', fontFamily: 'serif' },
        { text: 'means control', fontFamily: 'sans' },
      ],
      paragraphs: [
        'The self-hosted setup means Alternative Partners owns the full stack: no vendor access to their data, no dependency on a SaaS pricing model, full control over how the system evolves. The migration was fast because of AI; the result is durable because the stack is open source.',
      ],
    },
  ],
  tableOfContents: [
    'AI in the migration workflow',
    'Self-hosted means control',
  ],
  catalogCard: {
    summary:
      'Alternative Partners replaced Salesforce with self-hosted Twenty, using agentic AI to compress migration work.',
    date: '2025',
  },
};

export const metadata: Metadata = {
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
};

export default async function AlternativePartnersCaseStudyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  let storySectionIndex = 0;
  const sectionBlocks = CASE_STUDY.sections.map((block, index) => {
    if (block.type === 'text') {
      const sectionId = `case-study-section-${storySectionIndex}`;
      storySectionIndex += 1;
      return (
        <CaseStudy.TextBlock key={index} block={block} sectionId={sectionId} />
      );
    }
    return <CaseStudy.VisualBlock key={index} block={block} />;
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

      <CaseStudy.Hero hero={CASE_STUDY.hero} />

      {sectionBlocks}

      <CaseStudy.SectionNav items={CASE_STUDY.tableOfContents} />
    </>
  );
}
