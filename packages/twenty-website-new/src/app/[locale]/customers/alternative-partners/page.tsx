import { msg } from '@lingui/core/macro';
import { Heading, HeadingPart } from '@/design-system/components';
import type { CaseStudyData } from '@/lib/customers';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { buildLocalizedMetadata } from '@/lib/seo';
import { CaseStudyPageLayout } from '@/app/[locale]/customers/_components/CaseStudyPageLayout';

const PLACEHOLDER_HERO =
  'https://images.unsplash.com/photo-1702047149248-a6049168a2a8?w=1600&q=80';

const META_TITLE = msg`From Salesforce to self-hosted Twenty, powered by AI | Alternative Partners`;
const META_DESCRIPTION = msg`How Alternative Partners migrated from Salesforce to self-hosted Twenty using agentic AI in the implementation loop: fast migration, durable ownership.`;

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/alternative-partners',
  title: META_TITLE,
  description: META_DESCRIPTION,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function AlternativePartnersCaseStudyPage({
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
            {i18n._(msg`From Salesforce to`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`self-hosted Twenty`)}
          </HeadingPart>
        </Heading>
      ),
      author: 'Benjamin Reynolds',
      authorAvatarSrc: '/images/partner/testimonials/benjamin-reynolds.webp',
      authorRole: msg`Principal and Founder, Alternative Partners`,
      clientIcon: 'alternative-partners',
      heroImageSrc: PLACEHOLDER_HERO,
      industry: msg`Consulting`,
      kpis: [
        { value: msg`AI-assisted`, label: msg`Salesforce migration` },
        { value: msg`Self-hosted`, label: msg`Full ownership` },
      ],
    },
    sections: [
      {
        type: 'text',
        eyebrow: msg`Alternative Partners`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`AI in the`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`migration workflow`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Alternative Partners is a consulting firm that moved from Salesforce to a self-hosted Twenty instance. Benjamin Reynolds led the migration. He had already become a Twenty expert implementing Twenty for one of Twenty's first cloud customers.`,
          msg`His approach was unconventional. Instead of mapping fields manually, scripting transforms, and validating data step by step, he handed the job to agentic AI tools with a brief: where the data lives, the GitHub repo for the target platform, and the Railway deployment. Start, and only return if something breaks beyond a 70% confidence fix.`,
          msg`It worked. This is AI-assisted iteration in practice: not AI as a product feature, but as part of implementation work, compressing what would typically be weeks into something one person can oversee without being the bottleneck.`,
        ],
      },
      {
        type: 'text',
        eyebrow: msg`Ownership`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Self-hosted`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`means control`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`The self-hosted setup means Alternative Partners owns the full stack: no vendor access to their data, no dependency on a SaaS pricing model, full control over how the system evolves. The migration was fast because of AI; the result is durable because the stack is open source.`,
        ],
      },
    ],
    tableOfContents: [
      msg`AI in the migration workflow`,
      msg`Self-hosted means control`,
    ],
    catalogCard: {
      summary: msg`Alternative Partners replaced Salesforce with self-hosted Twenty, using agentic AI to compress migration work.`,
      date: msg`2025`,
    },
  };

  return (
    <CaseStudyPageLayout
      caseStudy={caseStudy}
      path="/customers/alternative-partners"
    />
  );
}
