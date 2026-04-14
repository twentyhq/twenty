import { MENU_DATA } from '@/app/_constants';
import type { CaseStudyData } from '@/app/case-studies/_constants/types';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudy } from '@/sections/CaseStudy/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

const PLACEHOLDER_HERO = '/images/home/hero/avatars/katherine-adams.jpg';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title:
      'When your CRM is the product: W3Grads on Twenty — W3villa Technologies',
    description:
      'How W3villa Technologies shipped W3Grads, an AI mock interview platform for institutions, on Twenty as the operational backbone.',
  },
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
  sections: [
    {
      type: 'text',
      eyebrow: 'W3Grads',
      heading: [
        { text: 'Scale without ', fontFamily: 'serif' },
        { text: 'breaking operations', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Running mock interview programs for hundreds of students sounds straightforward. In practice, universities and training institutes hit the same wall: registrations entered by hand, interview links sent one by one, faculty reviewing every session without scoring or classification. At real scale, it breaks.',
        'W3villa Technologies set out to solve it properly — not with a workaround, but with a product.',
      ],
      callout:
        '"We did not want to patch over the problem. We wanted to build something institutions could rely on at scale, and that meant starting from a foundation solid enough to support the full complexity of what we had in mind." — Amrendra Pratap Singh, VP of Engineering, W3villa Technologies',
    },
    {
      type: 'text',
      eyebrow: 'Architecture',
      heading: [
        { text: 'Focus on the use case, ', fontFamily: 'serif' },
        { text: 'not the plumbing', fontFamily: 'sans' },
      ],
      paragraphs: [
        'W3villa built W3Grads (w3grads.com), an AI-powered mock interview platform for universities and training institutes, using Twenty as its operational backbone.',
        'The key decision was not to build everything from scratch. Twenty covers the data model, permissions, authentication, and workflow engine — the parts that would have taken months to rebuild — so the team could focus on product-specific logic.',
        'When a student registers via QR at a campus event, the system assigns a plan, generates an interview session, and sends a link. The AI conducts the interview, scores the candidate, and classifies the result. Faculty see where each student stands without manually reviewing every session. Building and iterating on these workflows was faster with AI in the loop.',
      ],
    },
    {
      type: 'text',
      eyebrow: 'Scale',
      heading: [
        { text: 'A platform ', fontFamily: 'serif' },
        { text: 'ready to grow', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Because the foundation is solid, W3Grads is architected for what comes next — including a payment layer for future paid interview plans and nationwide scale without structural rewrites.',
      ],
      callout:
        '"Twenty gave us the flexibility to model the entire interview lifecycle as custom objects and workflows. We could build something genuinely complex without fighting the platform to do it." — Piyush Khandelwal, Director, W3villa Technologies, Partner',
    },
    {
      type: 'text',
      eyebrow: 'The result',
      heading: [
        { text: 'Zero manual work ', fontFamily: 'serif' },
        { text: 'at the core', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Programs that previously needed heavy manual coordination now run end-to-end with automation. Institutions get a scalable, intelligent system; students get faster preparation for interviews that matter; W3villa shipped a product institutions can build revenue around.',
        'Zero manual work at the core. Full automation. Built on Twenty.',
      ],
    },
  ],
  tableOfContents: [
    'Scale without breaking operations',
    'Focus on the use case, not the plumbing',
    'A platform ready to grow',
    'The result',
  ],
  catalogCard: {
    summary:
      'W3villa shipped W3Grads on Twenty — AI interviews, scoring, and institution-scale workflows without rebuilding CRM plumbing.',
    date: '2025',
  },
};

export const metadata: Metadata = {
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
};

export default async function W3villaCaseStudyPage() {
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
