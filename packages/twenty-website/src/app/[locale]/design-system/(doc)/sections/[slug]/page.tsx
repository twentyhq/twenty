import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import CODE_FINDINGS from '@/platform/design-system/code-findings.json';
import COMPONENT_DOCS from '@/platform/design-system/component-docs.json';
import { toComponentSlug } from '@/platform/design-system/component-slug';
import {
  SectionPage,
  type Improvement,
} from '@/platform/design-system/SectionPage';

import { PagePreview } from '../../../PagePreview';
import { resolveSectionStage } from '../../../resolve-section-stage';
import { SectionPreview } from '../../../SectionPreview';

type DesignSystemSectionParams = LocaleRouteParams & { slug: string };

const sectionOf = (slug: string) =>
  COMPONENT_DOCS.sections.find(
    (section) => toComponentSlug(section.name) === slug,
  );

export const generateStaticParams = () =>
  COMPONENT_DOCS.sections.map((section) => ({
    slug: toComponentSlug(section.name),
  }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<DesignSystemSectionParams>;
}): Promise<Metadata> => ({
  title: `${sectionOf((await params).slug)?.name ?? 'Section'} · Design system`,
  robots: { index: false, follow: false },
});

type FindingEntry = {
  illustration: boolean;
  findings: {
    styled: string | null;
    line: number;
    severity: string;
    rule: string;
    fix: string | null;
    solutions: { label: string; effect: string }[];
  }[];
};

// The errors and warnings of the files the section renders from its own
// folder, one line per rule, with the fix computed for its first occurrence.
const improvementsOf = (dir: string, key: string): Improvement[] => {
  const byRule = new Map<string, Improvement>();
  const files = (
    (CODE_FINDINGS.rendered.sections as Record<string, string[]>)[key] ?? []
  ).filter((file) => file.startsWith(`sections/${dir}/`));
  for (const file of files) {
    const entry = (CODE_FINDINGS.files as Record<string, FindingEntry>)[file];
    if (!entry || entry.illustration) continue;
    for (const finding of entry.findings) {
      if (finding.severity === 'info') continue;
      const known = byRule.get(finding.rule);
      if (known) {
        known.count += 1;
        if (finding.styled && !known.styledNames.includes(finding.styled))
          known.styledNames.push(finding.styled);
        continue;
      }
      byRule.set(finding.rule, {
        rule: finding.rule,
        severity: finding.severity as Improvement['severity'],
        count: 1,
        first: `${file}:${finding.line}`,
        styledNames: finding.styled ? [finding.styled] : [],
        fix: finding.solutions[0]?.label ?? finding.fix,
        effect: finding.solutions[0]?.effect ?? null,
      });
    }
  }
  return [...byRule.values()].toSorted(
    (first, second) =>
      (first.severity === 'error' ? 0 : 1) -
        (second.severity === 'error' ? 0 : 1) || second.count - first.count,
  );
};

export default async function DesignSystemSectionRoute({
  params,
}: {
  params: Promise<DesignSystemSectionParams>;
}) {
  await getRouteI18n(params);
  const { locale, slug } = await params;
  const section = sectionOf(slug);
  if (!section) notFound();
  const stage = await resolveSectionStage(section);

  return (
    <SectionPage
      improvements={improvementsOf(section.dir, stage.key)}
      preview={
        stage.mode === 'alone' ? (
          <SectionPreview previewKey={stage.key} />
        ) : stage.mode === 'page' ? (
          <PagePreview
            locale={locale}
            params={stage.params}
            route={stage.route}
          />
        ) : null
      }
      previewNote={
        stage.mode === 'alone'
          ? 'Rendered by the site at your window width, shrunk to fit.'
          : stage.mode === 'page'
            ? `Needs its page: shown inside ${stage.url}, shrunk to fit. Inspect it to scroll.`
            : 'No page with a fixed URL shows it.'
      }
      slug={slug}
    />
  );
}
