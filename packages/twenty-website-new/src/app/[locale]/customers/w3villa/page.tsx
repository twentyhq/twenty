import { msg } from '@lingui/core/macro';
import { MENU_DATA } from '@/sections/Menu/data';
import { CustomersCaseStudySignoff } from '@/app/[locale]/customers/_components/CustomersCaseStudySignoff';
import { getCaseStudyPalette, type CaseStudyData } from '@/lib/customers';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudy } from '@/sections/CaseStudy/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import { buildLocalizedMetadata } from '@/lib/seo';

const PLACEHOLDER_HERO =
  'https://images.unsplash.com/photo-1756830231350-3b501f63c5c1?w=1600&q=80';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title: msg`When your CRM is the product: W3Grads on Twenty | W3villa Technologies`,
    description: msg`How W3villa Technologies shipped W3Grads, an AI mock interview platform for institutions, on Twenty as the operational backbone.`,
  },
  hero: {
    readingTime: '8 min',
    title: [
      { text: msg`When your CRM is`, fontFamily: 'serif' },
      { text: msg`the product`, fontFamily: 'sans', newLine: true },
    ],
    author: 'Amrendra Pratap Singh',
    authorAvatarSrc: '/images/partner/testimonials/amrendra-singh.webp',
    authorRole: msg`VP of Engineering, W3villa Technologies`,
    clientIcon: 'w3villa',
    heroImageSrc: PLACEHOLDER_HERO,
    industry: msg`EdTech`,
    kpis: [{ value: msg`Zero`, label: msg`Manual work at core` }],
  },
  sections: [
    {
      type: 'text',
      eyebrow: msg`W3Grads`,
      heading: [
        { text: msg`Scale without`, fontFamily: 'serif' },
        { text: msg`breaking operations`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`Running mock interview programs for hundreds of students sounds straightforward. In practice, universities and training institutes hit the same wall: registrations entered by hand, interview links sent one by one, faculty reviewing every session without scoring or classification. At real scale, it breaks.`,
        msg`W3villa Technologies set out to solve it properly, not with a workaround, but with a product.`,
      ],
      callout:
        '"We did not want to patch over the problem. We wanted to build something institutions could rely on at scale, and that meant starting from a foundation solid enough to support the full complexity of what we had in mind." - Amrendra Pratap Singh, VP of Engineering, W3villa Technologies',
    },
    {
      type: 'text',
      eyebrow: msg`Architecture`,
      heading: [
        {
          text: msg`Focus on the use case, not the`,
          fontFamily: 'serif',
        },
        { text: msg`plumbing`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`W3villa built W3Grads (w3grads.com), an AI-powered mock interview platform for universities and training institutes, using Twenty as its operational backbone.`,
        msg`The key decision was not to build everything from scratch. Twenty covers the data model, permissions, authentication, and workflow engine, the parts that would have taken months to rebuild, so the team could focus on product-specific logic.`,
        msg`When a student registers via QR at a campus event, the system assigns a plan, generates an interview session, and sends a link. The AI conducts the interview, scores the candidate, and classifies the result. Faculty see where each student stands without manually reviewing every session. Building and iterating on these workflows was faster with AI in the loop.`,
      ],
    },
    {
      type: 'text',
      eyebrow: msg`Scale`,
      heading: [
        {
          text: msg`A platform ready to`,
          fontFamily: 'serif',
        },
        { text: msg`grow`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`Because the foundation is solid, W3Grads is architected for what comes next, including a payment layer for future paid interview plans and nationwide scale without structural rewrites.`,
      ],
      callout:
        '"Twenty gave us the flexibility to model the entire interview lifecycle as custom objects and workflows. We could build something genuinely complex without fighting the platform to do it." - Piyush Khandelwal, Director, W3villa Technologies, Partner',
    },
    {
      type: 'text',
      eyebrow: msg`The result`,
      heading: [
        { text: msg`Zero manual work`, fontFamily: 'sans' },
        { text: msg`at the core`, fontFamily: 'serif' },
      ],
      paragraphs: [
        msg`Programs that previously needed heavy manual coordination now run end-to-end with automation. Institutions get a scalable, intelligent system; students get faster preparation for interviews that matter; W3villa shipped a product institutions can build revenue around.`,
        msg`Zero manual work at the core. Full automation. Built on Twenty.`,
      ],
    },
  ],
  tableOfContents: [
    msg`Scale without breaking operations`,
    msg`Focus on the use case, not the plumbing`,
    msg`A platform ready to grow`,
    msg`The result`,
  ],
  catalogCard: {
    summary: msg`W3villa shipped W3Grads on Twenty for AI interviews, scoring, and institution-scale workflows without rebuilding CRM plumbing.`,
    date: msg`2025`,
  },
};

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/w3villa',
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function W3villaCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const palette = getCaseStudyPalette('/customers/w3villa');

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
          renderText={renderText}
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
        renderText={renderText}
      />

      <CaseStudy.Highlights
        industry={CASE_STUDY.hero.industry}
        kpis={CASE_STUDY.hero.kpis}
        renderText={renderText}
      />

      <CaseStudy.Body>{sectionBlocks}</CaseStudy.Body>

      <CaseStudy.SectionNav items={CASE_STUDY.tableOfContents} />
      <CustomersCaseStudySignoff renderText={renderText} />
    </>
  );
}
