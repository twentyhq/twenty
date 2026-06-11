import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The app-preview token generation core: loads twenty-ui's theme (the
// product's design system) plus a small set of provenance-tracked product
// facts, and renders the mockup theme module. The product RENDERS at a
// 13px rem base (twenty-front/src/index.css), so fonts resolve rem × base
// and every other dimension passes through 1:1 — the mockup is the
// product's rendered values, never a scaled or hand-copied snapshot.
// Consumed by generate-app-preview-tokens.mjs (writes the module),
// check-app-preview-tokens.mjs (lint-time drift + policy check), and the
// product-parity battery (computes expectations from the same source).

const monorepoRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

// Each fact names its source and the exact pattern that anchors it; an
// anchor that stops matching is a loud failure, never a stale value.
const PRODUCT_FACT_SPECS = [
  {
    key: 'remBasePx',
    sourcePath: 'packages/twenty-front/src/index.css',
    pattern: /html\s*\{\s*font-size:\s*(\d+)px/,
    parse: Number,
  },
  {
    key: 'recordTableRowHeightPx',
    sourcePath:
      'packages/twenty-front/src/modules/object-record/record-table/constants/RecordTableRowHeight.ts',
    pattern: /RECORD_TABLE_ROW_HEIGHT = (\d+)/,
    parse: Number,
  },
  {
    key: 'navigationDrawerWidthPx',
    sourcePath:
      'packages/twenty-front/src/modules/ui/layout/resizable-panel/constants/NavigationDrawerConstraints.ts',
    pattern: /default: (\d+)/,
    parse: Number,
  },
];

const STANDARD_OBJECT_ICON_SOURCE = {
  sourcePath:
    'packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/create-standard-flat-object-metadata.util.ts',
  pattern:
    /labelPlural: i18nLabel\(msg`([^`]+)`\),[\s\S]{0,200}?icon: '(Icon\w+)'/g,
  // The workspace objects the mockup's sidebar presents.
  objectLabels: [
    'Companies',
    'People',
    'Opportunities',
    'Tasks',
    'Notes',
    'Dashboards',
    'Workflows',
  ],
};

function readProductFacts() {
  const facts = {};
  for (const spec of PRODUCT_FACT_SPECS) {
    const source = readFileSync(resolve(monorepoRoot, spec.sourcePath), 'utf8');
    const match = source.match(spec.pattern);
    if (!match) {
      throw new Error(
        `product fact anchor lost: ${spec.key} (${spec.sourcePath} no longer matches ${spec.pattern})`,
      );
    }
    facts[spec.key] = {
      value: spec.parse(match[1]),
      sourcePath: spec.sourcePath,
    };
  }

  const iconSource = readFileSync(
    resolve(monorepoRoot, STANDARD_OBJECT_ICON_SOURCE.sourcePath),
    'utf8',
  );
  const icons = {};
  for (const match of iconSource.matchAll(
    STANDARD_OBJECT_ICON_SOURCE.pattern,
  )) {
    icons[match[1]] = match[2];
  }
  const standardObjectIcons = {};
  for (const label of STANDARD_OBJECT_ICON_SOURCE.objectLabels) {
    if (!icons[label]) {
      throw new Error(
        `product fact anchor lost: standard object "${label}" icon not found in ${STANDARD_OBJECT_ICON_SOURCE.sourcePath}`,
      );
    }
    standardObjectIcons[label] = icons[label];
  }
  facts.standardObjectIcons = {
    value: standardObjectIcons,
    sourcePath: STANDARD_OBJECT_ICON_SOURCE.sourcePath,
  };

  return facts;
}

function resolveFontSizePx(remValue, remBasePx) {
  const rem = Number(remValue.replace('rem', ''));
  return Math.round(rem * remBasePx * 100) / 100;
}

async function buildTheme() {
  const theme = await import('twenty-ui/theme');
  const facts = readProductFacts();
  const remBasePx = facts.remBasePx.value;
  const spacingBasePx = theme.THEME_COMMON.spacingMultiplicator;

  const fontSizePx = Object.fromEntries(
    Object.entries(theme.FONT_COMMON.size).map(([token, rem]) => [
      token,
      resolveFontSizePx(rem, remBasePx),
    ]),
  );

  // background.noisy is a CSS-var reference in the product; the mockup's
  // noise belongs to the authored stage tokens, so it is skipped here.
  const { noisy: _noisy, ...background } = theme.BACKGROUND_LIGHT;

  return {
    facts,
    values: {
      font: {
        family: theme.FONT_COMMON.family,
        sizePx: fontSizePx,
        weight: theme.FONT_COMMON.weight,
        color: theme.FONT_LIGHT.color,
      },
      background,
      border: {
        color: theme.BORDER_LIGHT.color,
        radius: theme.BORDER_COMMON.radius,
      },
      accent: theme.ACCENT_LIGHT,
      gray: theme.GRAY_SCALE_LIGHT,
      grayAlpha: theme.GRAY_SCALE_LIGHT_ALPHA,
      tag: theme.TAG_LIGHT,
      boxShadow: theme.BOX_SHADOW_LIGHT,
      icon: theme.ICON,
      spacingBasePx,
      table: theme.THEME_COMMON.table,
      chrome: {
        navigationDrawerWidthPx: facts.navigationDrawerWidthPx.value,
        navigationItemHeightPx: spacingBasePx * 7,
        pageBarMinHeightPx: spacingBasePx * 8,
        recordTableRowHeightPx: facts.recordTableRowHeightPx.value,
      },
      standardObjectIcons: facts.standardObjectIcons.value,
    },
  };
}

function renderModule({ facts, values }) {
  const provenance = Object.entries(facts)
    .map(([key, fact]) => `//   ${key} ← ${fact.sourcePath}`)
    .join('\n');

  return `// GENERATED by scripts/generate-app-preview-tokens.mjs — DO NOT EDIT.
// The product mockup's visual vocabulary, derived from twenty-ui's theme
// and these product facts (drift-checked in lint):
${provenance}
// Fonts are the product's RENDERED sizes (rem × ${facts.remBasePx.value}px base); everything
// else passes through 1:1. Nothing in the mockup scales — the stage does.
export const APP_PREVIEW_THEME = ${JSON.stringify(values, null, 2)};
`;
}

export const appPreviewTokenGeneration = {
  buildTheme,
  renderModule,
  outputPath: 'src/tokens/app-preview/app-preview-theme.ts',
};
