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
  'https://images.unsplash.com/photo-1744830343976-ce690ba2a67c?w=1600&q=80';

const META_TITLE = msg`A CRM that grows with you | NetZero & Twenty`;
const META_DESCRIPTION = msg`How NetZero uses Twenty across carbon credits, agricultural products, and franchised industrial systems with a modular CRM and a roadmap toward AI-assisted workflows.`;

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/netzero',
  title: META_TITLE,
  description: META_DESCRIPTION,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function NetZeroCaseStudyPage({
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
            {i18n._(msg`A CRM that`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">{i18n._(msg`grows`)}</HeadingPart>{' '}
          <HeadingPart fontFamily="serif">{i18n._(msg`with you`)}</HeadingPart>
        </Heading>
      ),
      author: 'Olivier Reinaud',
      authorAvatarSrc: '/images/partner/testimonials/olivier-reinaud.webp',
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
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`The right`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`foundation`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`NetZero works with the agro-industry, serving clients from multinationals to smallholder farmers. They sell carbon credits, agricultural products, and franchised industrial systems across three different product lines, multiple countries, and multiple company sizes. When Olivier Reinaud, co-founder of NetZero, started looking at CRMs in late 2024, he was not chasing the most feature-rich platform. He wanted the right foundation.`,
        ],
        callout:
          '"Twenty delivers on what CRMs should have always been: fairly priced software with a fully modular and customizable model, a clean and modern UI, granular permissions, automations, enterprise features. A compelling solution with high potential to rightfully disrupt the CRM market." - Olivier Reinaud, co-founder of NetZero',
      },
      {
        type: 'text',
        eyebrow: msg`Flexibility`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`A business that does not fit a`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">{i18n._(msg`template`)}</HeadingPart>
          </Heading>
        ),
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
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`From simple to`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">{i18n._(msg`advanced`)}</HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Olivier recognizes that NetZero's current use of Twenty is still relatively simple: workflows and integrations are not yet as deep as he eventually wants, because he prioritized getting foundations right first.`,
          msg`What is planned is significant. NetZero has a data lake, online forms, and multiple internal systems that he wants to connect to Twenty. The pipes are there; the next step is automations that tie them together.`,
          msg`What is coming in April 2026 is what he has been waiting for: AI-assisted workflow creation, describing what he needs and iterating from there instead of building complex logic from scratch. For a founder who runs the CRM himself, that changes what is realistically possible.`,
        ],
      },
      {
        type: 'text',
        eyebrow: msg`Results`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`The bet is`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`paying off`)}
            </HeadingPart>
          </Heading>
        ),
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

  return (
    <CaseStudyPageLayout caseStudy={caseStudy} path="/customers/netzero" />
  );
}
