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
  'https://images.unsplash.com/photo-1756830231350-3b501f63c5c1?w=1600&q=80';

const META_TITLE = msg`When your CRM is the product: W3Grads on Twenty | W3villa Technologies`;
const META_DESCRIPTION = msg`How W3villa Technologies shipped W3Grads, an AI mock interview platform for institutions, on Twenty as the operational backbone.`;

export const generateMetadata = buildLocalizedMetadata({
  path: '/customers/w3villa',
  title: META_TITLE,
  description: META_DESCRIPTION,
});

type CaseStudyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function W3villaCaseStudyPage({
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
            {i18n._(msg`When your CRM is`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`the product`)}
          </HeadingPart>
        </Heading>
      ),
      author: 'Amrendra Pratap Singh',
      authorAvatarSrc: '/images/partner/testimonials/amrendra-singh.webp',
      authorRole: msg`VP of Engineering, W3villa Technologies`,
      clientIcon: 'w3villa',
      heroImageSrc: PLACEHOLDER_HERO,
      industry: msg`EdTech`,
      kpis: [{ value: msg`Zero`, label: msg`Manual work at core` }],
    },
    sections: [
      {
        type: 'text',
        eyebrow: msg`W3Grads`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Scale without`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`breaking operations`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Running mock interview programs for hundreds of students sounds straightforward. In practice, universities and training institutes hit the same wall: registrations entered by hand, interview links sent one by one, faculty reviewing every session without scoring or classification. At real scale, it breaks.`,
          msg`W3villa Technologies set out to solve it properly, not with a workaround, but with a product.`,
        ],
        callout:
          '"We did not want to patch over the problem. We wanted to build something institutions could rely on at scale, and that meant starting from a foundation solid enough to support the full complexity of what we had in mind." - Amrendra Pratap Singh, VP of Engineering, W3villa Technologies',
      },
      {
        type: 'text',
        eyebrow: msg`Architecture`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Focus on the use case, not the`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">{i18n._(msg`plumbing`)}</HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`W3villa built W3Grads (w3grads.com), an AI-powered mock interview platform for universities and training institutes, using Twenty as its operational backbone.`,
          msg`The key decision was not to build everything from scratch. Twenty covers the data model, permissions, authentication, and workflow engine, the parts that would have taken months to rebuild, so the team could focus on product-specific logic.`,
          msg`When a student registers via QR at a campus event, the system assigns a plan, generates an interview session, and sends a link. The AI conducts the interview, scores the candidate, and classifies the result. Faculty see where each student stands without manually reviewing every session. Building and iterating on these workflows was faster with AI in the loop.`,
        ],
      },
      {
        type: 'text',
        eyebrow: msg`Scale`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`A platform ready to`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">{i18n._(msg`grow`)}</HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Because the foundation is solid, W3Grads is architected for what comes next, including a payment layer for future paid interview plans and nationwide scale without structural rewrites.`,
        ],
        callout:
          '"Twenty gave us the flexibility to model the entire interview lifecycle as custom objects and workflows. We could build something genuinely complex without fighting the platform to do it." - Piyush Khandelwal, Director, W3villa Technologies, Partner',
      },
      {
        type: 'text',
        eyebrow: msg`The result`,
        heading: (
          <Heading size="md" weight="light">
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Zero manual work`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="serif">
              {i18n._(msg`at the core`)}
            </HeadingPart>
          </Heading>
        ),
        paragraphs: [
          msg`Programs that previously needed heavy manual coordination now run end-to-end with automation. Institutions get a scalable, intelligent system; students get faster preparation for interviews that matter; W3villa shipped a product institutions can build revenue around.`,
          msg`Zero manual work at the core. Full automation. Built on Twenty.`,
        ],
      },
    ],
    tableOfContents: [
      msg`Scale without breaking operations`,
      msg`Focus on the use case, not the plumbing`,
      msg`A platform ready to grow`,
      msg`The result`,
    ],
    catalogCard: {
      summary: msg`W3villa shipped W3Grads on Twenty for AI interviews, scoring, and institution-scale workflows without rebuilding CRM plumbing.`,
      date: msg`2025`,
    },
  };

  return (
    <CaseStudyPageLayout caseStudy={caseStudy} path="/customers/w3villa" />
  );
}
