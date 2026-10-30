import postcss, { type Container } from 'postcss';

import { wrapInTwentyUiCascadeLayer } from '../wrapInTwentyUiCascadeLayer';

const SOURCE_DIRECTORY = '/twenty-ui/src';

const BUTTON_STYLESHEET_PATH = `${SOURCE_DIRECTORY}/primitives/input/Button/Button.module.scss`;

const processStylesheet = ({
  css,
  filePath,
}: {
  css: string;
  filePath: string;
}) =>
  postcss([
    wrapInTwentyUiCascadeLayer({ sourceDirectory: SOURCE_DIRECTORY }),
  ]).process(css, { from: filePath }).root;

const getChildLabels = (container: Container) =>
  (container.nodes ?? []).map((node) => {
    if (node.type === 'atrule') {
      return `@${node.name} ${node.params}`;
    }

    return node.type === 'rule' ? node.selector : node.type;
  });

const getLayerChildLabels = (container: Container) => {
  const layer = (container.nodes ?? []).find(
    (node) => node.type === 'atrule' && node.name === 'layer',
  );

  return layer?.type === 'atrule' ? getChildLabels(layer) : [];
};

describe('wrapInTwentyUiCascadeLayer', () => {
  it('moves every rule of a twenty-ui stylesheet into the twenty-ui layer', () => {
    const root = processStylesheet({
      css: `
        .root { color: red; }
        @media (hover: hover) { .root:hover { color: blue; } }
        @keyframes spin { to { rotate: 1turn; } }
      `,
      filePath: BUTTON_STYLESHEET_PATH,
    });

    expect(getChildLabels(root)).toEqual(['@layer twenty-ui']);
    expect(getLayerChildLabels(root)).toEqual([
      '.root',
      '@media (hover: hover)',
      '@keyframes spin',
    ]);
  });

  it('keeps @charset and @import ahead of the layer', () => {
    const root = processStylesheet({
      css: `@charset "UTF-8"; @import url('fonts.css'); .root { content: '·'; }`,
      filePath: BUTTON_STYLESHEET_PATH,
    });

    expect(getChildLabels(root)).toEqual([
      '@charset "UTF-8"',
      "@import url('fonts.css')",
      '@layer twenty-ui',
    ]);
  });

  it('leaves top-level :global rules unlayered', () => {
    const root = processStylesheet({
      css: `
        .editor :global(.monaco-editor) { background-color: red; }
        .editor { display: contents; }
      `,
      filePath: `${SOURCE_DIRECTORY}/components/code-editor/CodeEditor/CodeEditor.module.scss`,
    });

    expect(getChildLabels(root)).toEqual([
      '.editor :global(.monaco-editor)',
      '@layer twenty-ui',
    ]);
    expect(getLayerChildLabels(root)).toEqual(['.editor']);
  });

  it('rejects :global rules nested in an at-rule', () => {
    expect(() =>
      processStylesheet({
        css: `@media (hover: hover) { .item:hover :global(.hook) { opacity: 1; } }`,
        filePath: BUTTON_STYLESHEET_PATH,
      }),
    ).toThrow('Keep :global(...) rules at the top level');
  });

  it('wraps stylesheets requested with a Vite query', () => {
    const root = processStylesheet({
      css: '.root { color: red; }',
      filePath: `${BUTTON_STYLESHEET_PATH}?inline`,
    });

    expect(getChildLabels(root)).toEqual(['@layer twenty-ui']);
  });

  it.each([
    `${SOURCE_DIRECTORY}/primitives/layout/Collapsible/__stories__/Collapsible.stories.module.scss`,
    `${SOURCE_DIRECTORY}/theme/theme-light.css`,
    '/twenty-front/src/modules/Example.module.scss',
  ])('leaves %s unlayered', (filePath) => {
    const root = processStylesheet({
      css: '.root { color: red; }',
      filePath,
    });

    expect(getChildLabels(root)).toEqual(['.root']);
  });
});
