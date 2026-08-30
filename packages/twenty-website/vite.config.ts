import { cloudflare } from '@cloudflare/vite-plugin';
import { lingui } from '@lingui/vite-plugin';
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel';
import { cdnAdapter } from '@vinext/cloudflare/cache/cdn-adapter';
import { kvDataAdapter } from '@vinext/cloudflare/cache/kv-data-adapter';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import wyw from '@wyw-in-js/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vinext from 'vinext';

const RSC_EVAL_STUB = fileURLToPath(
  new URL('./linaria-rsc-eval-stub.cjs', import.meta.url),
);

// wyw emits the original on-disk source minus the styled templates, discarding
// whatever earlier plugins produced, so its output is TS/JSX again. The rsc and
// client environments lower that afterwards; the ssr one does not, and those
// modules reach Rolldown unparseable. reactCompilerPreset scopes itself to
// `consumer === 'client'`, so this cannot ride along with it and is declared
// without an environment filter.
const syntaxPreset = defineRolldownBabelPreset({
  preset: () => ({
    presets: [
      ['@babel/preset-react', { runtime: 'automatic' }],
      ['@babel/preset-typescript', { allowDeclareFields: true }],
    ],
  }),
  rolldown: {},
});

// Ordered after wyw, which registers itself at enforce: 'post'.
const lowerSyntaxAfterLinaria = async () => ({
  ...(await babel({ include: /\.[jt]sx?/, presets: [syntaxPreset] })),
  name: 'lower-syntax-after-linaria',
  enforce: 'post' as const,
});

// next.config.ts drove Linaria through webpack (next-with-linaria) and the
// Lingui macro through SWC (@lingui/swc-plugin). Neither pipeline exists under
// Vite, so both are re-declared here.
export default defineConfig({
  plugins: [
    react(),
    lingui(),
    // The Lingui macro needs Babel; Vite 8 runs Rolldown, so it comes in through
    // @rolldown/plugin-babel. Babel applies plugins before presets, which is the
    // order Lingui requires: the macro has to expand before React Compiler
    // rewrites the component.
    //
    // The default filter anchors the extension at the end of the id, which
    // misses the suffixed ids plugin-rsc gives 'use client' modules.
    babel({
      include: /\.[jt]sx?/,
      plugins: ['@lingui/babel-plugin-lingui-macro'],
      presets: [reactCompilerPreset()],
    }),
    // wyw ships at enforce: 'post'. It signals its CSS by appending
    // `import "<module>.wyw-in-js.css"`, and plugin-rsc analyses the server
    // graph for stylesheets before post transforms run, so on a server component
    // that import is never seen and the emitted asset is never linked. Client
    // components are unaffected: their CSS is resolved from the client bundle
    // graph, which sees imports added at any stage.
    {
      ...wyw({
        include: ['**/*.{ts,tsx}'],
        exclude: ['**/node_modules/**'],
        // wyw emits the original source minus the styled templates, so it needs to
        // know the syntax it is handing back.
        oxcOptions: {
          transform: {
            jsx: {
              runtime: 'automatic',
            },
          },
        },
        // Linaria computes CSS by executing the module graph and resolves
        // next/link in the RSC environment regardless of the importer's
        // 'use client' directive, reaching the React Server runtime, which throws
        // without the `react-server` condition. Link contributes no styles.
        importOverrides: Object.fromEntries(
          [
            'next/link',
            '@vitejs/plugin-rsc/react/rsc',
            '@vitejs/plugin-rsc/react/rsc/server',
          ].map((source) => [source, { mock: RSC_EVAL_STUB }]),
        ),
      }),
      enforce: undefined,
    },
    lowerSyntaxAfterLinaria(),
    vinext({
      // react() is registered above so the Lingui and React Compiler Babel
      // passes can be attached; vinext would otherwise add its own copy.
      react: false,
      cache: { data: kvDataAdapter(), cdn: cdnAdapter() },
    }),
    cloudflare({
      viteEnvironment: {
        name: 'rsc',
        childEnvironments: ['ssr'],
      },
    }),
  ],
});
