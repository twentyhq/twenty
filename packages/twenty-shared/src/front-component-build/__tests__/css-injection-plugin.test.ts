/** @jest-environment node */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

import { build, context } from 'esbuild';

import { cssInjectionPlugin } from '../css-injection-plugin';

describe('cssInjectionPlugin', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'component-css-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('injects bundled CSS with relative imports and embedded assets', async () => {
    await writeFile(join(directory, 'entry.js'), "import './style.css';");
    await writeFile(
      join(directory, 'style.css'),
      '@import "./nested.css"; .image { background: url("./icon.svg"); }',
    );
    await writeFile(
      join(directory, 'nested.css'),
      '.nested { color: purple; }',
    );
    await writeFile(
      join(directory, 'icon.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"/>',
    );

    const result = await build({
      entryPoints: [join(directory, 'entry.js')],
      bundle: true,
      write: false,
      plugins: [cssInjectionPlugin],
    });
    const source = result.outputFiles.map((file) => file.text).join('\n');
    const styles: { textContent?: string }[] = [];

    runInNewContext(source, {
      document: {
        createElement: () => ({}),
        head: {
          appendChild: (style: { textContent?: string }) => styles.push(style),
        },
      },
    });

    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain('.nested');
    expect(styles[0]?.textContent).toContain('data:image/svg+xml');
    expect(styles[0]?.textContent).not.toContain('@import');
    expect(styles[0]?.textContent).not.toContain('url("./icon.svg")');
    expect(() => runInNewContext(source)).not.toThrow();
  });

  it('fails the build when an imported stylesheet is missing', async () => {
    await writeFile(join(directory, 'style.css'), '@import "./missing.css";');

    await expect(
      build({
        entryPoints: [join(directory, 'style.css')],
        bundle: true,
        write: false,
        logLevel: 'silent',
        plugins: [cssInjectionPlugin],
      }),
    ).rejects.toThrow('missing.css');
  });

  it('rebuilds when nested CSS and assets change in native watch mode', async () => {
    const nestedStylesheet = join(directory, 'nested.css');
    const asset = join(directory, 'icon.svg');
    await writeFile(
      join(directory, 'style.css'),
      '@import "./nested.css"; .image { background: url("./icon.svg"); }',
    );
    await writeFile(nestedStylesheet, '.nested { color: purple; }');
    await writeFile(asset, '<svg xmlns="http://www.w3.org/2000/svg"/>');
    let finishBuild = (_source: string) => {};
    const nextBuild = () =>
      new Promise<string>((resolveBuild, rejectBuild) => {
        const timeout = setTimeout(
          () => rejectBuild(new Error('CSS rebuild did not finish')),
          2000,
        );
        finishBuild = (source) => {
          clearTimeout(timeout);
          resolveBuild(source);
        };
      });
    let result = nextBuild();
    const buildContext = await context({
      absWorkingDir: directory,
      entryPoints: ['style.css'],
      bundle: true,
      write: false,
      plugins: [
        cssInjectionPlugin,
        {
          name: 'observe-build',
          setup: (build) => {
            build.onEnd((result) => {
              finishBuild(
                result.outputFiles?.map((file) => file.text).join('') ?? '',
              );
            });
          },
        },
      ],
    });

    try {
      await buildContext.watch();
      expect(await result).toContain('purple');
      result = nextBuild();
      await writeFile(nestedStylesheet, '.nested { color: green; }');
      expect(await result).toContain('green');
      result = nextBuild();
      await writeFile(
        asset,
        '<svg xmlns="http://www.w3.org/2000/svg">changed</svg>',
      );
      expect(await result).toContain('changed');
    } finally {
      await buildContext.dispose();
    }
  });
});
