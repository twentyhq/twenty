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
  'https://images.unsplash.com/photo-1687600154329-150952c73169?w=1600&q=80';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title: msg`Burned by vendor lock-in, AC&T built a CRM they actually own | Twenty`,
    description: msg`How AC&T Education Migration and Flycoder replaced a shuttered vendor CRM with self-hosted Twenty, with 90%+ lower cost and full ownership.`,
  },
  hero: {
    readingTime: '7 min',
    title: [
      { text: msg`A CRM they`, fontFamily: 'serif' },
      { text: msg`actually own`, fontFamily: 'sans', newLine: true },
    ],
    author: 'Joseph Chiang',
    authorAvatarSrc: '/images/partner/testimonials/joseph-chiang.jpg',
    authorRole: msg`CRM Engineer, AC&T Education Migration`,
    clientIcon: 'act-education',
    heroImageSrc: PLACEHOLDER_HERO,
    industry: msg`Education`,
    kpis: [{ value: msg`90%+`, label: msg`Lower CRM cost` }],
  },
  sections: [
    {
      type: 'text',
      eyebrow: msg`AC&T Education Migration`,
      heading: [
        { text: msg`When the vendor`, fontFamily: 'serif' },
        { text: msg`pulled the plug`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`AC&T Education Migration (actimmi.com) is an education agency in Australia. They help international students with applications to education providers and visas. They had been on a previous CRM until the vendor shut the system down, leaving nothing but a CSV export.`,
        msg`Whatever came next had to be something they could own.`,
      ],
      callout:
        '"They did not want to learn someone else\'s system. They wanted to keep working the way they already did and make it smoother." - Joseph Chiang, CRM Engineer, AC&T Education Migration',
    },
    {
      type: 'text',
      eyebrow: msg`Implementation`,
      heading: [
        {
          text: msg`No more renting someone else's`,
          fontFamily: 'serif',
        },
        { text: msg`structure`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`They evaluated Salesforce, Zoho, Pipedrive, and SuiteCRM. Each came with the same tradeoffs: too expensive, too rigid, or too generic, and none fixed the underlying problem. They were still renting a structure they did not control.`,
        msg`Flycoder, a full-stack development partner, helped them set up Twenty as a self-hosted instance shaped around how AC&T actually operates. The data model centers on students, not a generic contact-and-deal pipeline. Statuses update automatically: a workflow runs nightly to keep enrollment records current. Automated email reminders cover important dates. Adding a new record takes under a minute.`,
        msg`The result is a system that fits how AC&T already worked, instead of the other way around.`,
      ],
    },
    {
      type: 'text',
      eyebrow: msg`Control`,
      heading: [
        { text: msg`Control without`, fontFamily: 'serif' },
        { text: msg`the overhead`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`Self-hosted means AC&T carries no vendor risk: no pricing model that can change, no platform that can disappear, no forced migration. The system is theirs.`,
        msg`Because everything is built on Twenty's open foundation, Flycoder could wire the exact logic AC&T needed without fighting the platform.`,
      ],
    },
    {
      type: 'text',
      eyebrow: msg`The result`,
      heading: [
        {
          text: msg`Costs down more than`,
          fontFamily: 'serif',
        },
        { text: msg`90%`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`CRM costs dropped by more than 90%. Manual overhead tied to the old system is gone. For the first time, AC&T has a CRM they will not lose again.`,
        msg`They did not just replace a tool. They took back ownership of how their business runs.`,
      ],
    },
  ],
  tableOfContents: [
    msg`When the vendor pulled the plug`,
    msg`No more renting someone else's structure`,
    msg`Control without the overhead`,
    msg`The result`,
  ],
  catalogCard: {
    summary: msg`AC&T and Flycoder moved from a dead vendor export to self-hosted Twenty, with over 90% lower CRM cost and full control.`,
    date: msg`2025`,
  },
};

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/act-education',
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ActEducationCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
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
