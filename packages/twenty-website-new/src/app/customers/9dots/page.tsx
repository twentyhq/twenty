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
  'https://images.unsplash.com/photo-1733244766159-f58f4184fd38?w=1600&q=80';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title:
      'Homeseller, WhatsApp, and a CRM built around the business | Nine Dots & Twenty',
    description:
      'How Nine Dots Ventures rebuilt a Singapore real estate agency on Twenty with APIs, n8n, Grafana, and AI on top of 2,000+ WhatsApp messages a day.',
  },
  hero: {
    readingTime: '9 min',
    title: [
      { text: 'A real estate agency on WhatsApp ', fontFamily: 'serif' },
      { text: 'built a ', fontFamily: 'serif' },
      { text: 'CRM', fontFamily: 'sans', newLine: true },
      { text: ' around it', fontFamily: 'serif' },
    ],
    author: 'Mike Babiy & Azmat Parveen',
    authorAvatarSrc: '/images/partner/testimonials/mike-babiy.png',
    authorRole: 'Founder, Nine Dots Ventures',
    clientIcon: 'nine-dots',
    heroImageSrc: PLACEHOLDER_HERO,
    industry: 'Real Estate',
    kpis: [
      { value: '150 hrs', label: 'Saved / month' },
      { value: '2,000+', label: 'Daily messages' },
      { value: 'Q1 2026', label: 'Record quarter' },
    ],
    quote: {
      text: 'Twenty lets us build a CRM around the business and not the business around the CRM.',
      author: 'Mike Babiy',
      role: 'Founder, Nine Dots Ventures',
    },
  },
  sections: [
    {
      type: 'text',
      eyebrow: 'Homeseller',
      heading: [
        { text: 'When the channel is ', fontFamily: 'serif' },
        { text: 'the business', fontFamily: 'sans' },
      ],
      paragraphs: [
        "Homeseller is a high-volume real estate agency in Singapore, founded by one of the country's top-performing property agents. The whole operation runs on WhatsApp: no email, no calendars, just group chats, thousands of them, with clients, agents, and leads together.",
        'That works until you need to understand the business underneath. Which deals are stuck? Where are leads coming from? What is the close rate? With spreadsheets and a legacy custom CRM that could not keep up, those questions were nearly impossible to answer.',
        'Mike and Azmat from Nine Dots stepped in to fix that, not by changing how Homeseller works, but by building a system that finally fit around it.',
      ],
      callout:
        '"Twenty lets us build a CRM around the business and not the business around the CRM." - Mike Babiy, Founder, Nine Dots Ventures',
    },
    {
      type: 'text',
      eyebrow: 'Architecture',
      heading: [
        { text: 'The CRM as a ', fontFamily: 'serif' },
        { text: 'control hub', fontFamily: 'sans' },
      ],
      paragraphs: [
        "Nine Dots rebuilt Homeseller's operations on Twenty, with a custom data model shaped around their sales flow. Because Twenty is open and everything is accessible via API, they connected it to what the business actually needed: n8n for automated workflows (in-app workflows were not available at that time), Grafana for live dashboards fed from Twenty, and a custom AI layer to parse and extract structured insights from more than 2,000 WhatsApp messages a day.",
        'Homeseller kept their habits. WhatsApp stayed WhatsApp. What changed is that everything flowing through those conversations now lands in a structured system, tracked, classified, and visible in real time.',
      ],
      callout:
        '"Twenty is the heart of the system. Everything branches from it." - Azmat Parveen, Nine Dots Ventures',
    },
    {
      type: 'text',
      eyebrow: 'The result',
      heading: [
        { text: '150 hours', fontFamily: 'sans' },
        { text: ' saved every month', fontFamily: 'serif' },
      ],
      paragraphs: [
        'About 150 hours per month saved in manual operations. Real-time metrics for the business owner. Growth readiness without adding operational headcount. A team that can answer questions that used to take days to piece together.',
        'The full rollout landed in July 2025. Since then, Nine Dots built a Smart Assistant on top of the system, nudging agents with tasks, reminders, and on-demand market analysis. Some agents never open Twenty directly, yet they are powered by it, outperforming peers on manual processes alone. By Q1 2026, Homeseller had recorded its best sales quarter ever.',
      ],
    },
  ],
  tableOfContents: [
    'When the channel is the business',
    'The CRM as a control hub',
    'The result',
  ],
  catalogCard: {
    summary:
      "Nine Dots put Twenty at the center of Homeseller's stack with APIs, automation, and AI on top of WhatsApp-heavy operations.",
    date: 'Jul 2025',
  },
};

export const metadata: Metadata = {
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
};

export default async function NineDotsCaseStudyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const palette = getCaseStudyPalette('/customers/9dots');

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
