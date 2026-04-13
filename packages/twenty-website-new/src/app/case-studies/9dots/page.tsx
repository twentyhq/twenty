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
    title:
      'Homeseller, WhatsApp, and a CRM built around the business — Nine Dots & Twenty',
    description:
      'How Nine Dots Ventures rebuilt a Singapore real estate agency on Twenty with APIs, n8n, Grafana, and AI on top of 2,000+ WhatsApp messages a day.',
  },
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
  sections: [
    {
      type: 'text',
      eyebrow: 'Homeseller',
      heading: [
        { text: 'When the channel ', fontFamily: 'serif' },
        { text: 'is the business', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Homeseller is a high-volume real estate agency in Singapore, founded by one of the country\'s top-performing property agents. The whole operation runs on WhatsApp: no email, no calendars — group chats, thousands of them, with clients, agents, and leads together.',
        'That works until you need to understand the business underneath. Which deals are stuck? Where are leads coming from? What is the close rate? With spreadsheets and a legacy custom CRM that could not keep up, those questions were nearly impossible to answer.',
        'Mike and Azmat from Nine Dots stepped in to fix that — not by changing how Homeseller works, but by building a system that finally fit around it.',
      ],
      callout:
        '"Twenty lets us build a CRM around the business and not the business around the CRM." — Mike Babiy, Founder, Nine Dots Ventures',
    },
    {
      type: 'text',
      eyebrow: 'Architecture',
      heading: [
        { text: 'The CRM ', fontFamily: 'serif' },
        { text: 'as a control hub', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Nine Dots rebuilt Homeseller\'s operations on Twenty, with a custom data model shaped around their sales flow. Because Twenty is open and everything is accessible via API, they connected it to what the business actually needed: n8n for automated workflows (in-app workflows were not available at that time), Grafana for live dashboards fed from Twenty, and a custom AI layer to parse and extract structured insights from more than 2,000 WhatsApp messages a day.',
        'Homeseller kept their habits. WhatsApp stayed WhatsApp. What changed is that everything flowing through those conversations now lands in a structured system — tracked, classified, and visible in real time.',
      ],
      callout:
        '"Twenty is the heart of the system. Everything branches from it." — Azmat Parveen, Nine Dots Ventures',
    },
    {
      type: 'text',
      eyebrow: 'The result',
      heading: [
        { text: '150 hours ', fontFamily: 'serif' },
        { text: 'saved every month', fontFamily: 'sans' },
      ],
      paragraphs: [
        'About 150 hours per month saved in manual operations. Real-time metrics for the business owner. Growth readiness without adding operational headcount. A team that can answer questions that used to take days to piece together.',
        'The full rollout landed in July 2025. Since then, Nine Dots built a Smart Assistant on top of the system — nudging agents with tasks, reminders, and on-demand market analysis. Some agents never open Twenty directly, yet they are powered by it, outperforming peers on manual processes alone. By Q1 2026, Homeseller had recorded its best sales quarter ever.',
      ],
    },
  ],
  testimonial: {
    eyebrow: 'What they say',
    quote:
      'Twenty lets us build a CRM around the business and not the business around the CRM.',
    author: {
      name: 'Mike Babiy',
      handle: 'Founder, Nine Dots Ventures',
      date: 'July 2025',
      avatarSrc: PLACEHOLDER_HERO,
    },
  },
  tableOfContents: [
    'When the channel is the business',
    'The CRM as a control hub',
    'The result',
  ],
  catalogCard: {
    summary:
      'Nine Dots put Twenty at the center of Homeseller\'s stack with APIs, automation, and AI on top of WhatsApp-heavy operations.',
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
