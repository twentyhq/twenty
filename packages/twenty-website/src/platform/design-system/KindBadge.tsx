'use client';

import { styled } from '@linaria/react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

// Figma's vocabulary for designers: ❖ main component, ◇ private brick, etc.
// The kind itself is computed from the code by the generator.
const KINDS = {
  component: {
    glyph: '❖',
    label: 'Component',
    hint: 'Use it directly in a page.',
  },
  internal: {
    glyph: '◇',
    label: 'Internal brick',
    hint: 'Builds another component. Not meant to be used on its own, like a private _component in Figma.',
  },
  layout: {
    glyph: '▭',
    label: 'Layout',
    hint: 'Draws nothing: it only sets spacing, like an auto layout frame.',
  },
  decor: {
    glyph: '✦',
    label: 'Decor',
    hint: 'A decorative layer, hidden from assistive technology.',
  },
  section: {
    glyph: '▦',
    label: 'Ready-made section',
    hint: 'A complete section to place as is, like a template.',
  },
} as const;

export type ComponentKind = keyof typeof KINDS;

const Badge = styled.span`
  align-items: center;
  border: 1px solid ${color('pink')};
  border-radius: ${radius(8)};
  color: ${semanticColor.ink};
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(1.5)};
  padding: ${spacing(0.5)} ${spacing(2)};
  white-space: nowrap;

  & > span:first-child {
    color: ${color('pink')};
  }
`;

export function KindBadge({
  kind,
  withHint = false,
}: {
  kind: ComponentKind;
  withHint?: boolean;
}) {
  const meta = KINDS[kind];
  return (
    <span title={meta.hint}>
      <Badge>
        <span aria-hidden>{meta.glyph}</span>
        {meta.label}
      </Badge>
      {withHint ? <> {meta.hint}</> : null}
    </span>
  );
}
