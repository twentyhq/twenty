import { msg } from '@lingui/core/macro';
import { type CaseStudyData } from '@/lib/customers';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { buildLocalizedMetadata } from '@/lib/seo';
import { Heading, HeadingPart } from '@/design-system/components';
import { CaseStudyPageLayout } from '@/app/[locale]/customers/_components/CaseStudyPageLayout';

const PLACEHOLDER_HERO =
  'https://images.unsplash.com/photo-1733244766159-f58f4184fd38?w=1600&q=80';

const META_TITLE = msg`Homeseller, WhatsApp, and a CRM built around the business | Nine Dots & Twenty`;
const META_DESCRIPTION = msg`How Nine Dots Ventures rebuilt a Singapore real estate agency on Twenty with APIs, n8n, Grafana, and AI on top of 2,000+ WhatsApp messages a day.`;

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/9dots',
  title: META_TITLE,
  description: META_DESCRIPTION,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function NineDotsCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const i18n = await getRouteI18n(params);

  const caseStudy: CaseStudyData = {
    meta: {
      title: META_TITLE,
      description: META_DESCRIPTION,
    },
    hero: {
      readingTime: '9 min',
      title: (
        <Heading as="h1" size="xl" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`A real estate agency on WhatsApp`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="serif">{i18n._(msg`built a`)}</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">{i18n._(msg`CRM`)}</HeadingPart>{' '}
          <HeadingPart fontFamily="serif">{i18n._(msg`around it`)}</HeadingPart>
        </Heading>
      ),
      author: 'Mike Babiy & Azmat Parveen',
      authorAvatarSrc: '/images/partner/testimonials/mike-babiy.webp',
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
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`When the channel is`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`the business`)}
            </HeadingPart>
          </Heading>
        ),
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
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`The CRM as a`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`control hub`)}
            </HeadingPart>
          </Heading>
        ),
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
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="sans">
              {i18n._(msg`150 hours`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="serif">
              {i18n._(msg`saved every month`)}
            </HeadingPart>
          </Heading>
        ),
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

  return <CaseStudyPageLayout caseStudy={caseStudy} path="/customers/9dots" />;
}
