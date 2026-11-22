import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import CODE_FINDINGS from '@/platform/design-system/code-findings.json';
import COMPONENT_DOCS from '@/platform/design-system/component-docs.json';
import { ComponentStage } from '@/platform/design-system/ComponentStage';
import { toComponentSlug } from '@/platform/design-system/component-slug';
import {
  InspectView,
  type Problem,
} from '@/platform/design-system/InspectView';
import { toPageSlug } from '@/platform/design-system/page-slug';

import { PagePreview } from '../../../PagePreview';
import { resolvePagePreview } from '../../../resolve-page-preview';
import { SECTION_PREVIEWS } from '../../../section-previews';
import { SectionPreview } from '../../../SectionPreview';

type InspectParams = LocaleRouteParams & { kind: string; slug: string };

const sectionOf = (slug: string) =>
  COMPONENT_DOCS.sections.find(
    (section) => toComponentSlug(section.name) === slug,
  );
const pageOf = (slug: string) =>
  COMPONENT_DOCS.pages.find(
    (page) => !page.layout && toPageSlug(page.route) === slug,
  );

export const generateStaticParams = () => [
  ...COMPONENT_DOCS.components.map((component) => ({
    kind: 'components',
    slug: toComponentSlug(component.name),
  })),
  ...COMPONENT_DOCS.sections.map((section) => ({
    kind: 'sections',
    slug: toComponentSlug(section.name),
  })),
  ...COMPONENT_DOCS.pages
    .filter((page) => !page.layout)
    .map((page) => ({ kind: 'pages', slug: toPageSlug(page.route) })),
];

export const metadata: Metadata = {
  title: 'Inspect · Design system',
  robots: { index: false, follow: false },
};

// The hand-written values of every file a page or section renders.
const problemsOf = (files: string[]): Problem[] =>
  [...new Set(files)].flatMap((file) => {
    const entry = CODE_FINDINGS.files[file as keyof typeof CODE_FINDINGS.files];
    if (!entry) return [];
    return entry.findings.map((finding) => ({
      file,
      line: finding.line,
      styled: finding.styled,
      property: finding.property,
      value: finding.value,
      severity: finding.severity as Problem['severity'],
      rule: finding.rule,
      fix: finding.fix,
      solutions: finding.solutions,
      declarations: finding.styled
        ? ((
            entry.styled as Record<
              string,
              { declarations: Problem['declarations'] }
            >
          )[finding.styled]?.declarations ?? null)
        : null,
      illustration: entry.illustration,
    }));
  });

// A page or a section alone, at the window's full width, with its problems.
export default async function DesignSystemInspectRoute({
  params,
}: {
  params: Promise<InspectParams>;
}) {
  await getRouteI18n(params);
  const { locale, kind, slug } = await params;
  const rendered = CODE_FINDINGS.rendered;

  if (kind === 'components') {
    const component = COMPONENT_DOCS.components.find(
      (entry) => toComponentSlug(entry.name) === slug,
    );
    if (!component) notFound();
    return (
      <InspectView
        docHref={`/design-system/components/${slug}`}
        note={`${component.name}, its default render and the examples of its doc page. Problems: ${component.file} and the ui files it renders.`}
        problems={problemsOf(
          rendered.components[
            component.name as keyof typeof rendered.components
          ] ?? [],
        )}
        title={component.name}
      >
        <ComponentStage slug={slug} />
      </InspectView>
    );
  }

  if (kind === 'sections') {
    const section = sectionOf(slug);
    if (!section) notFound();
    const key = `${section.dir}/${section.name}`;
    const alone = Boolean(SECTION_PREVIEWS[key]);
    const targets = alone
      ? []
      : await Promise.all(
          section.pages.map((route) => resolvePagePreview(route)),
        );
    const index = targets.findIndex((target) => target !== null);
    const target = index >= 0 ? targets[index] : null;
    const route = index >= 0 ? section.pages[index] : null;
    return (
      <InspectView
        docHref={`/design-system/sections/${slug}`}
        note={
          alone
            ? `${section.name} alone, as its pages render it. Problems: the files it renders.`
            : target
              ? `${section.name} inside ${target.url}, the page that gives it its data or its parent. Problems: the files of ${section.name} only.`
              : `${section.name} has no page with a fixed URL to show it in.`
        }
        problems={problemsOf(
          rendered.sections[key as keyof typeof rendered.sections] ?? [],
        )}
        title={section.name}
      >
        {alone ? (
          <SectionPreview previewKey={key} />
        ) : target && route ? (
          <PagePreview locale={locale} params={target.params} route={route} />
        ) : null}
      </InspectView>
    );
  }

  if (kind === 'pages') {
    const page = pageOf(slug);
    if (!page) notFound();
    const target = await resolvePagePreview(page.route);
    return (
      <InspectView
        docHref={`/design-system/pages/${slug}`}
        note={`${target?.url ?? page.route}, the page component inside the site layout. Problems: every file it and the layout render.`}
        problems={problemsOf([
          ...(rendered.pages[page.route as keyof typeof rendered.pages] ?? []),
          ...(rendered.pages['/*'] ?? []),
        ])}
        title={target?.url ?? page.route}
      >
        {target ? (
          <PagePreview
            locale={locale}
            params={target.params}
            route={page.route}
          />
        ) : null}
      </InspectView>
    );
  }

  notFound();
}
