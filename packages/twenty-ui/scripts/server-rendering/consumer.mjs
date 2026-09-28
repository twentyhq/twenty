import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const moduleFormat = process.argv[2];
assert.ok(['esm', 'commonjs'].includes(moduleFormat));

const BROWSER_GLOBAL_NAMES = [
  'window',
  'document',
  'navigator',
  'CSS',
  'getComputedStyle',
  'HTMLElement',
  'MutationObserver',
  'ResizeObserver',
];
for (const name of BROWSER_GLOBAL_NAMES) {
  assert.ok(Reflect.deleteProperty(globalThis, name), `Cannot remove ${name}`);
  assert.equal(typeof globalThis[name], 'undefined');
}

const load = (specifier) =>
  moduleFormat === 'esm' ? import(specifier) : require(specifier);
const packageRoot = resolve(dirname(require.resolve('twenty-ui')), '..');
const packageJson = JSON.parse(
  readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
);
const EDITOR_ENTRY = './components/code-editor';
const includeEditor = process.argv.includes('--editor');

if (process.argv.includes('--without-optional-peers')) {
  const optionalPeerDependencies = Object.entries(
    packageJson.peerDependenciesMeta,
  )
    .filter(([, { optional }]) => optional)
    .map(([dependency]) => dependency);
  for (const dependency of optionalPeerDependencies) {
    assert.throws(() => require.resolve(`${dependency}/package.json`), {
      code: 'MODULE_NOT_FOUND',
    });
  }
}

for (const [entry, target] of Object.entries(packageJson.exports)) {
  if (
    typeof target === 'string' ||
    entry === './testing' ||
    (entry === EDITOR_ENTRY && !includeEditor)
  ) {
    continue;
  }
  const specifier = entry === '.' ? 'twenty-ui' : `twenty-ui/${entry.slice(2)}`;
  await load(specifier);
}

const { createElement } = await load('react');
const { renderToString } = await load('react-dom/server');
const { Button } = await load('twenty-ui/primitives/input');
const { Tooltip } = await load('twenty-ui/primitives/surfaces');
const { OverflowingTextWithTooltip } = await load(
  'twenty-ui/primitives/typography',
);
const { Toaster, ToastProvider } = await load('twenty-ui/components');
const {
  getUserDevice,
  getOsControlSymbol,
  getOsShortcutSeparator,
  useIsMobile,
  useIsTouchDevice,
} = await load('twenty-ui/utilities');
const {
  ThemeProvider,
  THEME_DARK,
  themeCssVariables,
  useTheme,
  useThemeColorScheme,
  useThemeContainer,
} = await load('twenty-ui/theme');

assert.equal(getUserDevice(), 'unknown');
assert.equal(getOsControlSymbol(), 'Ctrl');
assert.equal(getOsShortcutSeparator(), ' ');

const shortcutButton = createElement(
  Button,
  { hotkeys: [getOsControlSymbol(), 'S'] },
  'Save record',
);
const buttonMarkup = renderToString(shortcutButton);
assert.match(buttonMarkup, /Save record/);
assert.match(buttonMarkup, /Ctrl S/);

const ResponsiveProbe = () =>
  createElement('span', {
    'data-mobile': useIsMobile(),
    'data-touch': useIsTouchDevice(),
  });
const responsiveMarkup = renderToString(createElement(ResponsiveProbe));
assert.match(responsiveMarkup, /data-mobile="false"/);
assert.match(responsiveMarkup, /data-touch="false"/);

const ThemeProbe = () => {
  const theme = useTheme();
  const colorScheme = useThemeColorScheme();
  const container = useThemeContainer();
  assert.equal(container, null);
  return createElement('span', {
    'data-color': theme.font.color.primary,
    'data-scheme': colorScheme,
  });
};
const providerlessMarkup = renderToString(createElement(ThemeProbe));
assert.ok(providerlessMarkup.includes(themeCssVariables.font.color.primary));
const scopedMarkup = renderToString(
  createElement(
    ThemeProvider,
    {
      colorScheme: 'dark',
      applyToRoot: false,
      overrides: { '--t-font-color-primary': '#123456' },
    },
    createElement(ThemeProbe),
    shortcutButton,
  ),
);
assert.match(scopedMarkup, /class="dark"/);
assert.match(scopedMarkup, /--t-font-color-primary:#123456/);
assert.match(scopedMarkup, /data-scheme="dark"/);
assert.ok(scopedMarkup.includes(themeCssVariables.font.color.primary));
const explicitMarkup = renderToString(
  createElement(
    ThemeProvider,
    {
      colorScheme: 'dark',
      theme: THEME_DARK,
      scale: 1.25,
    },
    createElement(ThemeProbe),
  ),
);
assert.ok(explicitMarkup.includes(THEME_DARK.font.color.primary));

for (const containerProps of [{}, { container: null }]) {
  assert.equal(
    renderToString(
      createElement(
        ToastProvider,
        null,
        createElement(Toaster, containerProps),
      ),
    ),
    '',
  );
}
assert.match(
  renderToString(
    createElement(Tooltip, { content: 'Save changes' }, shortcutButton),
  ),
  /Save record/,
);
assert.match(
  renderToString(
    createElement(OverflowingTextWithTooltip, { text: 'Server text' }),
  ),
  /Server text/,
);

if (includeEditor) {
  const { CodeEditor } = await load('twenty-ui/components/code-editor');
  const editorMarkup = renderToString(
    createElement(CodeEditor, {
      value: 'const answer = 42;',
      language: 'typescript',
      height: 240,
    }),
  );
  assert.match(editorMarkup, /--code-editor-height:240px/);
  assert.match(editorMarkup, /data-variant="default"/);
}

process.stdout.write(
  `Production imports and server rendering passed (${moduleFormat}${includeEditor ? ', with editor peers' : ', without editor'}).\n`,
);
