import { cloudflare } from '@cloudflare/vite-plugin';
import { lingui } from '@lingui/vite-plugin';
import { cdnAdapter } from '@vinext/cloudflare/cache/cdn-adapter';
import { kvDataAdapter } from '@vinext/cloudflare/cache/kv-data-adapter';
import react from '@vitejs/plugin-react';
import wyw from '@wyw-in-js/vite';
import { transformAsync } from '@babel/core';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import vinext from 'vinext';

const MACRO_SOURCES = ['@lingui/core/macro', '@lingui/react/macro'];

const RSC_EVAL_STUB = fileURLToPath(
  new URL('./linaria-rsc-eval-stub.cjs', import.meta.url),
);


// The Next build ran this as an SWC plugin over every module. Under Vite it has
// to run before @vitejs/plugin-rsc splits the graph: that plugin generates
// virtual client-boundary modules which no path-based filter can match, and any
// macro import surviving into one of them fails the bundle.
const linguiMacro = (): Plugin => ({
  name: 'lingui-macro',
  enforce: 'pre',
  async transform(code, id) {
    const [path] = id.split('?');

    if (!/\.[jt]sx?$/.test(path) || path.includes('/node_modules/')) {
      return null;
    }

    if (!MACRO_SOURCES.some((source) => code.includes(source))) {
      return null;
    }

    const result = await transformAsync(code, {
      filename: path,
      babelrc: false,
      configFile: false,
      sourceMaps: true,
      presets: [
        [
          '@babel/preset-typescript',
          { isTSX: path.endsWith('x'), allExtensions: true },
        ],
      ],
      plugins: ['@lingui/babel-plugin-lingui-macro'],
    });

    return result?.code ? { code: result.code, map: result.map } : null;
  },
});

// babelOptions is deliberately not passed: wyw-in-js.config.cjs already supplies
// them and anything set here replaces that file wholesale, dropping
// @wyw-in-js/babel-preset and silently extracting no CSS.
//
// importOverrides: Linaria computes CSS by executing the module graph and
// resolves next/link in the RSC environment regardless of the importer's
// 'use client' directive, reaching the React Server runtime, which throws
// without the `react-server` condition. Link contributes no styles, so
// evaluation gets a stub.
const linaria = (): Plugin =>
  wyw({
    importOverrides: Object.fromEntries(
      [
        'next/link',
        '@vitejs/plugin-rsc/react/rsc',
        '@vitejs/plugin-rsc/react/rsc/server',
      ].map((source) => [source, { mock: RSC_EVAL_STUB }]),
    ),
  }) as Plugin;

// wyw returns the original source minus the styled templates, so its output is
// still TS/JSX, and it runs at enforce: 'post' — after Vite has already done its
// TS/JSX transform. The rsc and client environments tolerate that; the ssr one
// parses with both disabled and throws. Re-normalizing wyw's output keeps every
// environment fed plain JS. Running wyw 'pre' instead is not an option: it then
// evaluates an unresolved graph and its eval runner times out.
const normalizeAfterLinaria = (): Plugin => ({
  name: 'normalize-after-linaria',
  enforce: 'post',
  async transform(code, id) {
    const [path] = id.split('?');

    if (!/\.tsx?$/.test(path) || path.includes('/node_modules/')) {
      return null;
    }

    const result = await transformAsync(code, {
      filename: path,
      babelrc: false,
      configFile: false,
      sourceMaps: true,
      presets: [
        ['@babel/preset-typescript', { isTSX: path.endsWith('x'), allExtensions: true }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    });

    return result?.code ? { code: result.code, map: result.map } : null;
  },
});

// next.config.ts drove these through webpack (next-with-linaria) and SWC
// (@lingui/swc-plugin). Neither pipeline exists under Vite, so the same
// transforms are re-declared here as Babel/Vite plugins.
export default defineConfig({
  plugins: [
    linguiMacro(),
    // Mirrors reactCompiler: true in next.config.ts.
    react({ compiler: true }),
    lingui(),
    linaria(),
    normalizeAfterLinaria(),
    vinext({
      // react() is registered above so the React Compiler Babel plugin can be
      // attached; vinext would otherwise add its own copy.
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
