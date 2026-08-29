// Applies EXT_meshopt_compression to assets/models/*.glb, roughly -70%.
//
// These .glb files are build-time sources only; build-model-geometry.mjs turns
// them into the .geo buffers the site loads, and does its own meshopt pass on
// the output. So this is a one-off repo-size tool, not a build step — it was
// removed from build:vinext, where it recompressed the inputs on every run.
//
// Deliberately not gltf-transform's `meshopt` helper: that runs quantize()
// first, which rewrites positions as integers and adds a compensating
// non-uniform node scale. The loader bakes world matrices into the geometry, so
// that scale reaches the normals, and these models feed a refractive material
// whose halftone pass turns normals into line density. The result is visible
// scatter instead of a silhouette, at every quantization level. The codec alone
// leaves coordinates untouched.
import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { NodeIO } from '@gltf-transform/core';
import {
  ALL_EXTENSIONS,
  EXTMeshoptCompression,
} from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const MODELS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'assets',
  'models',
);

const kilobytes = (bytes) => `${Math.round(bytes / 1024)}KB`;

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;

// The decoder reads back output from a previous run, which is what makes this
// safe to leave in the build.
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
  'meshopt.decoder': MeshoptDecoder,
});

const files = (await readdir(MODELS_DIR)).filter((name) => name.endsWith('.glb'));

async function compress(name) {
  const path = join(MODELS_DIR, name);
  const [sourceStat, document] = await Promise.all([
    stat(path),
    io.read(path),
  ]);
  const originalSize = sourceStat.size;

  const isAlreadyCompressed = document
    .getRoot()
    .listExtensionsUsed()
    .some(
      (extension) =>
        extension.extensionName === EXTMeshoptCompression.EXTENSION_NAME,
    );

  if (isAlreadyCompressed) {
    return { name, originalSize, compressedSize: originalSize, skipped: true };
  }

  document
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });

  await io.write(path, document);

  return {
    name,
    originalSize,
    compressedSize: (await stat(path)).size,
    skipped: false,
  };
}

const results = await Promise.all(files.map(compress));

let before = 0;
let after = 0;
let compressed = 0;
let skipped = 0;

for (const result of results) {
  before += result.originalSize;
  after += result.compressedSize;

  if (result.skipped) {
    skipped++;
    continue;
  }

  compressed++;
  console.log(
    `  ${result.name.padEnd(22)} ${kilobytes(result.originalSize).padStart(8)} -> ${kilobytes(result.compressedSize).padStart(7)}`,
  );
}

const saved = before === 0 ? 0 : Math.round(((before - after) / before) * 100);

console.log(
  `models: ${compressed} compressed, ${skipped} already compressed | ${kilobytes(before)} -> ${kilobytes(after)} (${saved}% smaller)`,
);
