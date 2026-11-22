'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  DURATION,
  color,
  PALETTE,
  TYPE_SCALE,
  UNITS,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { ALPHA_SCALE } from '@/tokens/alpha-scale';

import COMPONENT_DOCS from './component-docs.json';

// The values the site's tokens can produce, read from src/tokens and from the
// steps the code calls: anything rendered outside them is off the system.
const FONT_BASE_PX = UNITS.fontBaseRem * COMPONENT_DOCS.tokens.rootFontSizePx;
const rgbKey = (hex: string, alphaHex = 'ff') => {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((at) =>
    Number.parseInt(value.slice(at, at + 2), 16),
  );
  const alpha = Math.round((Number.parseInt(alphaHex, 16) / 255) * 100);
  return `${channels.join(',')},${alpha}`;
};
const ALLOWED_COLORS = new Set([
  ...Object.values(PALETTE).map((hex) => rgbKey(hex)),
  ...ALPHA_SCALE.colors.flatMap((name) =>
    Object.values(ALPHA_SCALE.stepHex).map((alpha) =>
      rgbKey(PALETTE[name], alpha),
    ),
  ),
]);
const ALLOWED_FONT_SIZES = new Set(
  [
    ...Object.values(TYPE_SCALE).flatMap((ramp) => [
      ramp.base.size,
      ramp.md.size,
    ]),
    ...COMPONENT_DOCS.tokens.fontSizeSteps,
  ].map((step) => Math.round(step * FONT_BASE_PX * 100) / 100),
);
const ALLOWED_DURATIONS = new Set(['0s', ...Object.values(DURATION)]);

type Rule = 'color' | 'font-size' | 'font-family' | 'duration';
const RULE_LABELS: Record<Rule, string> = {
  color: 'Color outside the palette',
  'font-size': 'Text size outside the scale',
  'font-family': 'Typeface outside the site fonts',
  duration: 'Duration outside DURATION',
};

const computedKey = (value: string) => {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const [red, green, blue, alpha = '1'] = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean);
  return `${red},${green},${blue},${Math.round(Number(alpha) * 100)}`;
};
const toMs = (value: string) =>
  value.endsWith('ms')
    ? Number.parseFloat(value)
    : Number.parseFloat(value) * 1000;

type Finding = { rule: Rule; detail: string; element: HTMLElement };

// Every rendered element of the preview, checked against the token values.
// Illustrations are counted apart: they redraw the app at its own sizes on
// purpose. The code marks them: aria-hidden, data-app-window (AppWindow.tsx)
// and data-mockup-stage (HomeHero's AppPreview stage).
const scan = (stage: HTMLElement, siteFamilies: Set<string>) => {
  const findings: Finding[] = [];
  let illustrated = 0;
  for (const element of stage.querySelectorAll<HTMLElement>('*')) {
    // Decorative illustrations, and the app reproductions AppWindow frames.
    if (
      element.closest(
        '[aria-hidden="true"], [aria-hidden=""], [data-app-window], [data-mockup-stage]',
      )
    ) {
      illustrated += 1;
      continue;
    }
    const style = getComputedStyle(element);
    const hasText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    for (const property of ['color', 'background-color', 'border-top-color']) {
      if (property === 'color' && !hasText) continue;
      if (property === 'border-top-color' && style.borderTopWidth === '0px')
        continue;
      const key = computedKey(style.getPropertyValue(property));
      if (!key || key.endsWith(',0')) continue;
      if (!ALLOWED_COLORS.has(key))
        findings.push({
          rule: 'color',
          detail: `${property}: ${style.getPropertyValue(property)}`,
          element,
        });
    }
    if (hasText) {
      const size = Math.round(Number.parseFloat(style.fontSize) * 100) / 100;
      if (!ALLOWED_FONT_SIZES.has(size))
        findings.push({
          rule: 'font-size',
          detail: `font-size: ${size}px`,
          element,
        });
      const family = style.fontFamily
        .split(',')[0]
        .replace(/["']/g, '')
        .trim()
        .toLowerCase();
      if (!siteFamilies.has(family))
        findings.push({
          rule: 'font-family',
          detail: `font-family: ${family}`,
          element,
        });
    }
    for (const duration of style.transitionDuration.split(',')) {
      const value = duration.trim();
      if (
        value !== '0s' &&
        ![...ALLOWED_DURATIONS].some((token) => toMs(token) === toMs(value))
      )
        findings.push({
          rule: 'duration',
          detail: `transition-duration: ${value}`,
          element,
        });
    }
  }
  return { findings, illustrated };
};

const Bar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
`;

const Toggle = styled.button`
  background: ${semanticColor.ink};
  border: none;
  border-radius: ${radius(2)};
  color: ${semanticColor.surface};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  padding: ${spacing(2)} ${spacing(3)};
`;

const Legend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)} ${spacing(4)};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  list-style: none;

  & li {
    color: ${semanticColor.inkMuted};
  }

  & strong {
    color: ${semanticColor.ink};
    font-weight: inherit;
  }
`;

const MARK = 'data-xray';

// Outlines, on the preview below, what renders outside the site's tokens.
// Hover an outlined element for the value and the rule it breaks.
export function XRay() {
  const [result, setResult] = useState<{
    counts: Record<Rule, number>;
    illustrated: number;
  } | null>(null);

  const clear = () => {
    for (const element of document.querySelectorAll<HTMLElement>(`[${MARK}]`)) {
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.removeAttribute('title');
      element.removeAttribute(MARK);
    }
  };

  const toggle = () => {
    clear();
    if (result) {
      setResult(null);
      return;
    }
    const stage = document.querySelector<HTMLElement>('[data-xray-stage]');
    if (!stage) return;
    // next/font sets the --font-* variables on the body, inherited here.
    const inherited = getComputedStyle(stage);
    const siteFamilies = new Set(
      COMPONENT_DOCS.tokens.fontFamilies.map((name) =>
        inherited
          .getPropertyValue(`--font-${name}`)
          .split(',')[0]
          .replace(/["']/g, '')
          .trim()
          .toLowerCase(),
      ),
    );
    const { findings, illustrated } = scan(stage, siteFamilies);
    const byElement = new Map<HTMLElement, string[]>();
    for (const finding of findings)
      byElement.set(finding.element, [
        ...(byElement.get(finding.element) ?? []),
        `${RULE_LABELS[finding.rule]} — ${finding.detail}`,
      ]);
    for (const [element, lines] of byElement) {
      element.setAttribute(MARK, '');
      element.style.outline = `${spacing(0.5)} solid ${color('error')}`;
      element.style.outlineOffset = '-1px';
      element.title = lines.join('\n');
    }
    const counts = { color: 0, 'font-size': 0, 'font-family': 0, duration: 0 };
    for (const finding of findings) counts[finding.rule] += 1;
    setResult({ counts, illustrated });
  };

  return (
    <Bar>
      <Toggle type="button" onClick={toggle}>
        {result ? 'Hide X-ray' : 'X-ray: show off-system values'}
      </Toggle>
      {result ? (
        <Legend aria-label="Off-system values">
          {(Object.keys(RULE_LABELS) as Rule[]).map((rule) => (
            <li key={rule}>
              {RULE_LABELS[rule]}: <strong>{result.counts[rule]}</strong>
            </li>
          ))}
          <li>
            Illustrations left out: <strong>{result.illustrated}</strong>
          </li>
        </Legend>
      ) : null}
    </Bar>
  );
}
