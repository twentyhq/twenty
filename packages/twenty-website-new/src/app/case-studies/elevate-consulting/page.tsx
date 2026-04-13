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
      'Twenty as the API backbone of a go-to-market stack — Elevate Consulting',
    description:
      'How Elevate Consulting moved off documents and spreadsheets to Twenty as the API-connected CRM at the center of their stack.',
  },
  hero: {
    readingTime: '8 min',
    title: [
      { text: 'Twenty as the API backbone ', fontFamily: 'serif' },
      { text: 'of a go-to-market stack', fontFamily: 'sans' },
    ],
    author: 'Justin Beadle',
    clientIcon: 'elevate-consulting',
    heroImageSrc: PLACEHOLDER_HERO,
  },
  sections: [
    {
      type: 'text',
      eyebrow: 'The situation',
      heading: [
        { text: 'From documents ', fontFamily: 'serif' },
        { text: 'to open APIs', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Elevate Consulting is a management consultancy based in Canada. When Justin Beadle, Director of Digital and Information, joined, the company ran entirely on Word documents, Excel spreadsheets, sticky notes, emails, and reliance on people. There was no CRM, no API-accessible tools — only a patchwork trying to stand in for a single source of truth.',
        'The CEO had resisted bringing in a CRM for years. The business development team had no experience using one, and the licensing costs of well-known CRMs like Salesforce or HubSpot were hard to justify without any guarantee of adoption: CRMs are only as good as the maintenance of the data inside them.',
        'In June 2025, Justin learned Twenty v1 had shipped. Within two or three days, the CEO asked him to look into setting up a CRM. The shift came from the potential of what could be built on top of fully open APIs. The timing was perfect.',
      ],
      callout:
        '"It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other. Twenty made that possible in a way older CRM platforms simply do not." — Justin Beadle, Director of Digital and Information, Elevate Consulting',
    },
    {
      type: 'text',
      eyebrow: 'Integration',
      heading: [
        { text: 'One API ', fontFamily: 'serif' },
        { text: 'to rule them all', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Justin\'s broader mission at Elevate has been to move the company off static documents and onto tools with API access. By the end of 2025, that was in place: time billing, resource planning, Microsoft Teams, and project management were all accessible via API, with Twenty at the center holding client and opportunity data. Team members could use that information strategically instead of re-keying it.',
        'That opened the door to something more powerful. Justin built a custom front end that pulls live data from those systems into a single view, tailored to each role. When a proposal is won, what used to require four separate people manually setting up instances across four different tools now happens in a single click, drawing on data collected in Twenty across the full opportunity lifecycle — another shift toward higher-value work for clients.',
        'Twenty is not only where CRM data lives. It is the API backbone that makes the rest of the stack possible.',
      ],
      callout:
        '"Because Twenty\'s API is fully open, I could connect it to every other tool in our stack. When a proposal is won, what used to take four people manually setting things up across four different tools now happens in a single click. That is the kind of time saving that only becomes possible when everything is connected." — Justin Beadle, Director of Digital and Information, Elevate Consulting',
    },
    {
      type: 'text',
      eyebrow: 'Adoption',
      heading: [
        { text: 'Workflows that ', fontFamily: 'serif' },
        { text: 'actually get used', fontFamily: 'sans' },
      ],
      paragraphs: [
        'The business development team finally had the CRM they had been asking for. Adoption came naturally: their data was already there when they logged in.',
        'Justin built workflows for notifications across the team, alerting the right people in Teams when a prospect becomes a lead or when project milestones are reached. Forms in Twenty let the business development team log activity without leaving the tool. The impact is real for the organization — the tool has been adaptable from opportunity-level work at a client to executive-level decisions.',
        'The flexibility to wire this together, without outside help and without fighting the platform, is what made it possible for a single person to stand up and maintain a connected stack across an entire consultancy.',
      ],
    },
    {
      type: 'text',
      eyebrow: 'What is next',
      heading: [
        { text: 'Beyond ', fontFamily: 'serif' },
        { text: 'internal rollout', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Elevate\'s CEO was so impressed with Twenty he started recommending it to clients before the internal setup was even complete. The team is exploring bringing Twenty to client projects as part of their consulting practice, including as the backend for custom-built products tailored to specific operational needs.',
        'For a firm that once ran on sticky notes, this is more than an upgrade — it is a complete transformation.',
      ],
    },
  ],
  testimonial: {
    eyebrow: 'What they say',
    quote:
      'Because Twenty\'s API is fully open, I could connect it to every other tool in our stack. When a proposal is won, what used to take four people across four tools now happens in a single click.',
    author: {
      name: 'Justin Beadle',
      handle: 'Director of Digital and Information, Elevate Consulting',
      date: 'June 2025',
      avatarSrc: PLACEHOLDER_HERO,
    },
  },
  tableOfContents: [
    'From documents to open APIs',
    'One API to rule them all',
    'Workflows that actually get used',
    'What is next',
  ],
  catalogCard: {
    summary:
      'Elevate Consulting uses Twenty as the API backbone connecting billing, Teams, resourcing, and a custom front end around client and opportunity data.',
    date: 'Jun 2025',
  },
};

export const metadata: Metadata = {
  title: CASE_STUDY.meta.title,
  description: CASE_STUDY.meta.description,
};

export default async function ElevateConsultingCaseStudyPage() {
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
