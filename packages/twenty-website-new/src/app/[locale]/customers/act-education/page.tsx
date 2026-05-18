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
  'https://images.unsplash.com/photo-1687600154329-150952c73169?w=1600&q=80';

const META_TITLE = msg`Burned by vendor lock-in, AC&T built a CRM they actually own | Twenty`;
const META_DESCRIPTION = msg`How AC&T Education Migration and Flycoder replaced a shuttered vendor CRM with self-hosted Twenty, with 90%+ lower cost and full ownership.`;

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/act-education',
  title: META_TITLE,
  description: META_DESCRIPTION,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ActEducationCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const i18n = await getRouteI18n(params);

  const caseStudy: CaseStudyData = {
    meta: {
      title: META_TITLE,
      description: META_DESCRIPTION,
    },
    hero: {
      readingTime: '7 min',
      title: (
        <Heading as="h1" size="xl" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`A CRM they`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`actually own`)}
          </HeadingPart>
        </Heading>
      ),
      author: 'Joseph Chiang',
      authorAvatarSrc: '/images/partner/testimonials/joseph-chiang.webp',
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
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`When the vendor`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`pulled the plug`)}
            </HeadingPart>
          </Heading>
        ),
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
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`No more renting someone else's`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`structure`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`They evaluated Salesforce, Zoho, Pipedrive, and SuiteCRM. Each came with the same tradeoffs: too expensive, too rigid, or too generic, and none fixed the underlying problem. They were still renting a structure they did not control.`,
          msg`Flycoder, a full-stack development partner, helped them set up Twenty as a self-hosted instance shaped around how AC&T actually operates. The data model centers on students, not a generic contact-and-deal pipeline. Statuses update automatically: a workflow runs nightly to keep enrollment records current. Automated email reminders cover important dates. Adding a new record takes under a minute.`,
          msg`The result is a system that fits how AC&T already worked, instead of the other way around.`,
        ],
      },
      {
        type: 'text',
        eyebrow: msg`Control`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Control without`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`the overhead`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Self-hosted means AC&T carries no vendor risk: no pricing model that can change, no platform that can disappear, no forced migration. The system is theirs.`,
          msg`Because everything is built on Twenty's open foundation, Flycoder could wire the exact logic AC&T needed without fighting the platform.`,
        ],
      },
      {
        type: 'text',
        eyebrow: msg`The result`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Costs down more than`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">{i18n._(msg`90%`)}</HeadingPart>
          </Heading>
        ),
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

  return (
    <CaseStudyPageLayout
      caseStudy={caseStudy}
      path="/customers/act-education"
    />
  );
}
