'use client';

import { SectionShell } from '@/ui';

import COMPONENT_DOCS from './component-docs.json';
import { COMPONENT_REGISTRY } from './component-registry';
import { toComponentSlug } from './component-slug';

// A component drawn for inspection: its default render and the examples of
// its doc page, each in a section of its own scheme.
export function ComponentStage({ slug }: { slug: string }) {
  const doc = COMPONENT_DOCS.components.find(
    (component) => toComponentSlug(component.name) === slug,
  );
  const content = COMPONENT_REGISTRY.find((entry) => entry.name === doc?.name);
  if (!doc || !content) return null;
  return (
    <>
      {content.renderWith ? (
        <SectionShell ariaLabel={`${doc.name}, default`} scheme="light">
          {content.renderWith({})}
        </SectionShell>
      ) : null}
      {(content.examples ?? []).map((example) => (
        <SectionShell
          key={example.id}
          ariaLabel={example.title}
          scheme={example.scheme ?? content.fixedScheme ?? 'light'}
        >
          {example.render()}
        </SectionShell>
      ))}
    </>
  );
}
