import { writeFile } from 'node:fs/promises';

import { introspectSchemaSdl, loginAndGetAccessToken } from './common.mjs';

// Usage: node introspect-schema.mjs <output-file.graphql>
const outputPath = process.argv[2];

if (!outputPath) {
  throw new Error('Usage: node introspect-schema.mjs <output-file.graphql>');
}

const token = await loginAndGetAccessToken();
const sdl = await introspectSchemaSdl({ token });

await writeFile(outputPath, sdl);
console.log(`Wrote ${sdl.length} chars of SDL to ${outputPath}`);
