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
  'https://images.unsplash.com/photo-1733244766159-f58f4184fd38?w=1600&q=80';

const CASE_STUDY: CaseStudyData = {
  meta: {
    title: msg`Homeseller, WhatsApp, and a CRM built around the business | Nine Dots & Twenty`,
    description: msg`How Nine Dots Ventures rebuilt a Singapore real estate agency on Twenty with APIs, n8n, Grafana, and AI on top of 2,000+ WhatsApp messages a day.`,
  },
  hero: {
    readingTime: '9 min',
    title: [
      {
        text: msg`A real estate agency on WhatsApp`,
        fontFamily: 'serif',
      },
      { text: msg`built a`, fontFamily: 'serif' },
      { text: msg`CRM`, fontFamily: 'sans', newLine: true },
      { text: msg`around it`, fontFamily: 'serif' },
    ],
    author: 'Mike Babiy & Azmat Parveen',
    authorAvatarSrc: '/images/partner/testimonials/mike-babiy.png',
    authorRole: msg`Founder, Nine Dots Ventures`,
    clientIcon: 'nine-dots',
    heroImageSrc: PLACEHOLDER_HERO,
    industry: msg`Real Estate`,
    kpis: [
      { value: msg`150 hrs`, label: msg`Saved / month` },
      { value: msg`2,000+`, label: msg`Daily messages` },
      { value: msg`Q1 2026`, label: msg`Record quarter` },
    ],
    quote: {
      text: msg`Twenty lets us build a CRM around the business and not the business around the CRM.`,
      author: 'Mike Babiy',
      role: msg`Founder, Nine Dots Ventures`,
    },
  },
  sections: [
    {
      type: 'text',
      eyebrow: msg`Homeseller`,
      heading: [
        {
          text: msg`When the channel is`,
          fontFamily: 'serif',
        },
        { text: msg`the business`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`Homeseller is a high-volume real estate agency in Singapore, founded by one of the country's top-performing property agents. The whole operation runs on WhatsApp: no email, no calendars, just group chats, thousands of them, with clients, agents, and leads together.`,
        msg`That works until you need to understand the business underneath. Which deals are stuck? Where are leads coming from? What is the close rate? With spreadsheets and a legacy custom CRM that could not keep up, those questions were nearly impossible to answer.`,
        msg`Mike and Azmat from Nine Dots stepped in to fix that, not by changing how Homeseller works, but by building a system that finally fit around it.`,
      ],
      callout:
        '"Twenty lets us build a CRM around the business and not the business around the CRM." - Mike Babiy, Founder, Nine Dots Ventures',
    },
    {
      type: 'text',
      eyebrow: msg`Architecture`,
      heading: [
        { text: msg`The CRM as a`, fontFamily: 'serif' },
        { text: msg`control hub`, fontFamily: 'sans' },
      ],
      paragraphs: [
        msg`Nine Dots rebuilt Homeseller's operations on Twenty, with a custom data model shaped around their sales flow. Because Twenty is open and everything is accessible via API, they connected it to what the business actually needed: n8n for automated workflows (in-app workflows were not available at that time), Grafana for live dashboards fed from Twenty, and a custom AI layer to parse and extract structured insights from more than 2,000 WhatsApp messages a day.`,
        msg`Homeseller kept their habits. WhatsApp stayed WhatsApp. What changed is that everything flowing through those conversations now lands in a structured system, tracked, classified, and visible in real time.`,
      ],
      callout:
        '"Twenty is the heart of the system. Everything branches from it." - Azmat Parveen, Nine Dots Ventures',
    },
    {
      type: 'text',
      eyebrow: msg`The result`,
      heading: [
        { text: msg`150 hours`, fontFamily: 'sans' },
        {
          text: msg`saved every month`,
          fontFamily: 'serif',
        },
      ],
      paragraphs: [
        msg`About 150 hours per month saved in manual operations. Real-time metrics for the business owner. Growth readiness without adding operational headcount. A team that can answer questions that used to take days to piece together.`,
        msg`The full rollout landed in July 2025. Since then, Nine Dots built a Smart Assistant on top of the system, nudging agents with tasks, reminders, and on-demand market analysis. Some agents never open Twenty directly, yet they are powered by it, outperforming peers on manual processes alone. By Q1 2026, Homeseller had recorded its best sales quarter ever.`,
      ],
    },
  ],
  tableOfContents: [
    msg`When the channel is the business`,
    msg`The CRM as a control hub`,
    msg`The result`,
  ],
  catalogCard: {
    summary: msg`Nine Dots put Twenty at the center of Homeseller's stack with APIs, automation, and AI on top of WhatsApp-heavy operations.`,
    date: msg`Jul 2025`,
  },
};

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/9dots',
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function NineDotsCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
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
