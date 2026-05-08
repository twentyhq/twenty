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
  'https://images.unsplash.com/photo-1744830343976-ce690ba2a67c?w=1600&q=80';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title: msg`A CRM that grows with you | NetZero & Twenty`,
    description: msg`How NetZero uses Twenty across carbon credits, agricultural products, and franchised industrial systems with a modular CRM and a roadmap toward AI-assisted workflows.`,
  },
  hero: {
    readingTime: '8 min',
    title: [
      { text: msg`A CRM that`, fontFamily: 'serif' },
      { text: msg`grows`, fontFamily: 'sans', newLine: true },
      { text: msg`with you`, fontFamily: 'serif' },
    ],
    author: 'Olivier Reinaud',
    authorAvatarSrc: '/images/partner/testimonials/olivier-reinaud.jpg',
    authorRole: msg`Co-founder, NetZero`,
    clientIcon: 'netzero',
    heroImageSrc: PLACEHOLDER_HERO,
    industry: msg`Agribusiness`,
    kpis: [
      { value: msg`3 product lines`, label: msg`On a single CRM` },
      { value: msg`No-code`, label: msg`Customizations` },
    ],
  },
  sections: [
    {
      type: 'text',
      eyebrow: msg`NetZero`,
      heading: [
        { text: msg`The right`, fontFamily: 'serif' },
        { text: msg`foundation`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`NetZero works with the agro-industry, serving clients from multinationals to smallholder farmers. They sell carbon credits, agricultural products, and franchised industrial systems across three different product lines, multiple countries, and multiple company sizes. When Olivier Reinaud, co-founder of NetZero, started looking at CRMs in late 2024, he was not chasing the most feature-rich platform. He wanted the right foundation.`,
      ],
      callout:
        '"Twenty delivers on what CRMs should have always been: fairly priced software with a fully modular and customizable model, a clean and modern UI, granular permissions, automations, enterprise features. A compelling solution with high potential to rightfully disrupt the CRM market." - Olivier Reinaud, co-founder of NetZero',
    },
    {
      type: 'text',
      eyebrow: msg`Flexibility`,
      heading: [
        {
          text: msg`A business that does not fit a`,
          fontFamily: 'serif',
        },
        { text: msg`template`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`What convinced Olivier was the flexibility of the platform and where it was headed. Even when initial needs were basic record-keeping, he still needed a custom data model with granular permissions to manage the wide range of NetZero activities. He also needed a system that could adapt quickly to a fast-iteration company.`,
        msg`With Twenty, when a new need appears, he can address it himself: no developer required, no support ticket.`,
      ],
      callout:
        '"The flexibility is really what made the difference. Our needs evolve very fast. I discover a new need and in two clicks I can address it. That is a real advantage when you are moving quickly." - Olivier Reinaud, co-founder of NetZero',
    },
    {
      type: 'text',
      eyebrow: msg`Roadmap`,
      heading: [
        { text: msg`From simple to`, fontFamily: 'serif' },
        { text: msg`advanced`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`Olivier recognizes that NetZero's current use of Twenty is still relatively simple: workflows and integrations are not yet as deep as he eventually wants, because he prioritized getting foundations right first.`,
        msg`What is planned is significant. NetZero has a data lake, online forms, and multiple internal systems that he wants to connect to Twenty. The pipes are there; the next step is automations that tie them together.`,
        msg`What is coming in April 2026 is what he has been waiting for: AI-assisted workflow creation, describing what he needs and iterating from there instead of building complex logic from scratch. For a founder who runs the CRM himself, that changes what is realistically possible.`,
      ],
    },
    {
      type: 'text',
      eyebrow: msg`Results`,
      heading: [
        { text: msg`The bet is`, fontFamily: 'serif' },
        { text: msg`paying off`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`While NetZero still runs a second CRM in parallel for WhatsApp-heavy operations with farmers in Brazil, they expect to migrate all of it to Twenty as features and the ecosystem grow. Already, their structured, multinational pipeline is powered by Twenty.`,
        msg`The early bet on the architecture is holding, and upcoming AI features are expected to make it even more relevant.`,
      ],
    },
  ],
  tableOfContents: [
    msg`The right foundation`,
    msg`A business that does not fit a template`,
    msg`From simple to advanced`,
    msg`The bet is paying off`,
  ],
  catalogCard: {
    summary: msg`NetZero uses Twenty as a modular CRM across product lines and countries, with a roadmap into AI-assisted workflows.`,
    date: msg`2025`,
  },
};

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/netzero',
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function NetZeroCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const palette = getCaseStudyPalette('/customers/netzero');

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
