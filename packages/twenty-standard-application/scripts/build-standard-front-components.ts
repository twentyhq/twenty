import crypto from 'crypto';
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { glob } from 'tinyglobby';
import { getBaseFrontComponentBuildOptions } from 'twenty-sdk/build';
import { kebabToCamelCase } from 'twenty-shared/utils';

const FRONT_COMPONENTS_DIR = path.resolve(__dirname, '../src/front-components');

const BUILT_OUTPUT_DIR = path.resolve(__dirname, '../src/build');

const MANIFEST_OUTPUT_PATH = path.resolve(
  __dirname,
  '../src/standard-front-component-build-manifest.ts',
);

const buildStandardFrontComponents = async () => {
  const tsxFiles = (
    await glob(['**/*.front-component.tsx'], {
      cwd: FRONT_COMPONENTS_DIR,
      absolute: true,
      onlyFiles: true,
    })
  ).sort();

  if (tsxFiles.length === 0) {
    throw new Error(
      `No .front-component.tsx files found in ${FRONT_COMPONENTS_DIR}`,
    );
  }

  fs.mkdirSync(BUILT_OUTPUT_DIR, { recursive: true });

  await esbuild.build({
    ...getBaseFrontComponentBuildOptions(),
    entryPoints: tsxFiles,
    outdir: BUILT_OUTPUT_DIR,
    outbase: FRONT_COMPONENTS_DIR,
    minify: true,
  });

  const manifestEntries: Record<
    string,
    { builtComponentPath: string; builtComponentChecksum: string }
  > = {};

  for (const tsxFile of tsxFiles) {
    const relativeTsx = path.relative(FRONT_COMPONENTS_DIR, tsxFile);
    const relativeMjs = relativeTsx.replace(
      '.front-component.tsx',
      '.front-component.mjs',
    );
    const mjsFilePath = path.join(BUILT_OUTPUT_DIR, relativeMjs);

    if (!fs.existsSync(mjsFilePath)) {
      throw new Error(`Expected built file not found: ${mjsFilePath}`);
    }

    const content = fs.readFileSync(mjsFilePath);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    const stem = path.basename(tsxFile, '.front-component.tsx');
    const camelKey = kebabToCamelCase(stem);

    manifestEntries[camelKey] = {
      builtComponentPath: relativeMjs,
      builtComponentChecksum: checksum,
    };
  }

  const manifestContent = `/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \\ \\ /\\ / / _ \\ '_ \\| __| | | | Auto-generated file
 *  | |  \\ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \\_/\\_/ \\___|_| |_|\\__|\\__, |
 *                              |___/
 */

export const STANDARD_FRONT_COMPONENT_BUILD_MANIFEST = ${JSON.stringify(manifestEntries, null, 2)} as const;
`;

  fs.writeFileSync(MANIFEST_OUTPUT_PATH, manifestContent);

  // eslint-disable-next-line no-console
  console.log(
    `Built ${tsxFiles.length} standard front components, manifest written to ${MANIFEST_OUTPUT_PATH}`,
  );
};

buildStandardFrontComponents().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to build standard front components:', error);
  process.exit(1);
});
