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
  'https://images.unsplash.com/photo-1758873269035-aae0e1fd3422?w=1600&q=80';

const META_TITLE = msg`Twenty as the API backbone of a go-to-market stack | Elevate Consulting`;
const META_DESCRIPTION = msg`How Elevate Consulting moved off documents and spreadsheets to Twenty as the API-connected CRM at the center of their stack.`;

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/elevate-consulting',
  title: META_TITLE,
  description: META_DESCRIPTION,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ElevateConsultingCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const i18n = await getRouteI18n(params);

  const caseStudy: CaseStudyData = {
    meta: {
      title: META_TITLE,
      description: META_DESCRIPTION,
    },
    hero: {
      readingTime: '8 min',
      title: (
        <Heading as="h1" size="xl" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Twenty as the`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`API backbone`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="serif">
            {i18n._(msg`of a go-to-market stack`)}
          </HeadingPart>
        </Heading>
      ),
      author: 'Justin Beadle',
      authorRole: msg`Director of Digital and Information, Elevate Consulting`,
      clientIcon: 'elevate-consulting',
      heroImageSrc: PLACEHOLDER_HERO,
      industry: msg`Management Consulting`,
      kpis: [
        { value: msg`1 click`, label: msg`Proposal automation` },
        { value: msg`4 tools`, label: msg`Connected via API` },
        { value: msg`API-first`, label: msg`Tool integration` },
      ],
      quote: {
        text: msg`It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other.`,
        author: 'Justin Beadle',
        role: msg`Director of Digital and Information, Elevate Consulting`,
      },
    },
    sections: [
      {
        type: 'text',
        eyebrow: msg`The situation`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`From documents to`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`open APIs`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Elevate Consulting is a management consultancy based in Canada. When Justin Beadle, Director of Digital and Information, joined, the company ran entirely on Word documents, Excel spreadsheets, sticky notes, emails, and reliance on people. There was no CRM, no API-accessible tools, only a patchwork trying to stand in for a single source of truth.`,
          msg`The CEO had resisted bringing in a CRM for years. The business development team had no experience using one, and the licensing costs of well-known CRMs like Salesforce or HubSpot were hard to justify without any guarantee of adoption: CRMs are only as good as the maintenance of the data inside them.`,
          msg`In June 2025, Justin learned Twenty v1 had shipped. Within two or three days, the CEO asked him to look into setting up a CRM. The shift came from the potential of what could be built on top of fully open APIs. The timing was perfect.`,
        ],
        callout:
          '"It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other. Twenty made that possible in a way older CRM platforms simply do not." - Justin Beadle, Director of Digital and Information, Elevate Consulting',
      },
      {
        type: 'text',
        eyebrow: msg`Integration`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">{i18n._(msg`One`)}</HeadingPart>{' '}
            <HeadingPart fontFamily="sans">{i18n._(msg`API`)}</HeadingPart>{' '}
            <HeadingPart fontFamily="serif">
              {i18n._(msg`to rule them all`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Justin's broader mission at Elevate has been to move the company off static documents and onto tools with API access. By the end of 2025, that was in place: time billing, resource planning, Microsoft Teams, and project management were all accessible via API, with Twenty at the center holding client and opportunity data. Team members could use that information strategically instead of re-keying it.`,
          msg`That opened the door to something more powerful. Justin built a custom front end that pulls live data from those systems into a single view, tailored to each role. When a proposal is won, what used to require four separate people manually setting up instances across four different tools now happens in a single click, drawing on data collected in Twenty across the full opportunity lifecycle. It is another shift toward higher-value work for clients.`,
          msg`Twenty is not only where CRM data lives. It is the API backbone that makes the rest of the stack possible.`,
        ],
        callout:
          '"Because Twenty\'s API is fully open, I could connect it to every other tool in our stack. When a proposal is won, what used to take four people manually setting things up across four different tools now happens in a single click. That is the kind of time saving that only becomes possible when everything is connected." - Justin Beadle, Director of Digital and Information, Elevate Consulting',
      },
      {
        type: 'text',
        eyebrow: msg`Adoption`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Workflows that`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`actually get used`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`The business development team finally had the CRM they had been asking for. Adoption came naturally: their data was already there when they logged in.`,
          msg`Justin built workflows for notifications across the team, alerting the right people in Teams when a prospect becomes a lead or when project milestones are reached. Forms in Twenty let the business development team log activity without leaving the tool. The impact is real for the organization. The tool has been adaptable from opportunity-level work at a client to executive-level decisions.`,
          msg`The flexibility to wire this together, without outside help and without fighting the platform, is what made it possible for a single person to stand up and maintain a connected stack across an entire consultancy.`,
        ],
      },
      {
        type: 'text',
        eyebrow: msg`What is next`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">{i18n._(msg`Beyond`)}</HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`internal rollout`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Elevate's CEO was so impressed with Twenty he started recommending it to clients before the internal setup was even complete. The team is exploring bringing Twenty to client projects as part of their consulting practice, including as the backend for custom-built products tailored to specific operational needs.`,
          msg`For a firm that once ran on sticky notes, this is more than an upgrade. It is a complete transformation.`,
        ],
      },
    ],
    tableOfContents: [
      msg`From documents to open APIs`,
      msg`One API to rule them all`,
      msg`Workflows that actually get used`,
      msg`What is next`,
    ],
    catalogCard: {
      summary: msg`Elevate Consulting uses Twenty as the API backbone connecting billing, Teams, resourcing, and a custom front end around client and opportunity data.`,
      date: msg`Jun 2025`,
    },
  };

  return (
    <CaseStudyPageLayout
      caseStudy={caseStudy}
      path="/customers/elevate-consulting"
    />
  );
}
