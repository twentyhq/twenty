'use client';

import { styled } from '@linaria/react';
import { useSearchParams } from 'next/navigation';

import { SCHEMES, spacing, type Scheme } from '@/tokens';
import { SectionShell } from '@/ui';

import { axisValues, combinations } from './component-axes';
import COMPONENT_DOCS from './component-docs.json';
import { COMPONENT_REGISTRY } from './component-registry';
import { toComponentSlug } from './component-slug';

const Stage = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(4)};
  justify-content: center;
  min-height: 100vh;
  padding: ${spacing(6)};

  &[data-layout='stack'] {
    align-items: stretch;
    flex-direction: column;
  }
`;

// One component alone, for the docs to frame: what Storybook's iframe.html
// is to the app's UI Library. ?show= picks what to render: nothing for the
// default render, "overview" for every enum combination, a prop name for
// each of its values, or an example id from the component's content file.
export function ComponentEmbed({ slug }: { slug: string }) {
  const params = useSearchParams();
  const doc = COMPONENT_DOCS.components.find(
    (component) => toComponentSlug(component.name) === slug,
  );
  const content = COMPONENT_REGISTRY.find((entry) => entry.name === doc?.name);
  if (!doc || !content) return null;

  const requested = params.get('scheme');
  const scheme: Scheme =
    content.fixedScheme ??
    (requested && requested in SCHEMES ? (requested as Scheme) : 'light');
  const show = params.get('show');
  const axes = doc.props.filter(
    (prop) =>
      axisValues(prop).length > 1 &&
      !(content.hiddenAxes ?? []).includes(prop.name),
  );
  const render = (props: Record<string, unknown>) =>
    content.renderWith?.(props) ?? null;

  const body = (() => {
    if (!show) {
      return content.renderWith
        ? render({})
        : (content.examples?.[0]?.render() ?? null);
    }
    if (show === 'overview') {
      return combinations(axes.filter((prop) => prop.values !== null)).map(
        (row) => <span key={Object.values(row).join('-')}>{render(row)}</span>,
      );
    }
    const axis = axes.find((prop) => prop.name === show);
    if (axis) {
      return axisValues(axis).map((value) => (
        <span key={String(value)}>{render({ [axis.name]: value })}</span>
      ));
    }
    return content.examples?.find((example) => example.id === show)?.render();
  })();

  return (
    <SectionShell flushInline rhythm="flush" scheme={scheme}>
      <Stage data-layout={content.layout ?? 'row'}>{body}</Stage>
    </SectionShell>
  );
}
