// Converts assets/models/*.glb into flat .geo buffers in public/models, which
// is what the site loads, replacing three's GLTFLoader at runtime.
//
// The .glb sources live outside public/ on purpose: nothing loads them at
// runtime any more, and leaving them there deployed both formats.
//
// The halftone materials never sample model textures, so parsing a full glTF
// document graph in the browser buys nothing. Meshes are merged in world space
// here, exactly as the old loader did on every mount.
//
// Normals are not stored: normalizeGeometry recomputes them after scaling and
// rotating, so any that shipped in the glb were discarded anyway.
//
// Vertex data stays meshopt-compressed: raw float32 brotlis to between 0.9x and
// 1.5x the meshopt glb, so shipping it uncompressed would cost more transfer
// than the loader saves. The runtime keeps MeshoptDecoder (26KB) and drops
// GLTFLoader (115KB).
//
// This supersedes optimize-models.mjs for the shipping path: that script
// recompresses the .glb sources in place, which no longer reach the browser.
//
// The whole file is then gzipped, and the loader inflates it with the browser's
// native DecompressionStream. Cloudflare only compresses an allowlist of
// content types and application/octet-stream is not on it, so .geo shipped
// completely uncompressed — 1298KB of models on the home page alone. Doing it
// in the file removes the CDN from the equation entirely: -47%, and no
// geometry changes.
//
// Simplification is deliberately not attempted. These meshes are unwelded
// (footer: 155k vertices, 39.7k unique positions), so every edge reads as a
// border and meshopt_simplify collapses nothing. Welding first would fix that
// but 90% of the coincident-vertex groups differ by more than 5 degrees of
// normal — they are real creases on an extruded logo, and merging them rounds
// the edges off.
//
// Output layout, little-endian, before gzip: magic 'TWGE', uint32 version,
// uint32 vertexCount, uint32 indexCount, uint32 positionByteLength, uint32
// indexByteLength, then the position and index blobs.
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = join(PACKAGE_ROOT, 'assets', 'models');
const OUTPUT_DIR = join(PACKAGE_ROOT, 'public', 'models');

const GEOMETRY_VERSION = 4;

const kilobytes = (bytes) => `${Math.round(bytes / 1024)}KB`;

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
  'meshopt.decoder': MeshoptDecoder,
});

function multiplyMatrices(a, b) {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[row] * b[column * 4] +
        a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] +
        a[12 + row] * b[column * 4 + 3];
    }
  }
  return out;
}

function transformPoint(matrix, x, y, z) {
  const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] || 1;
  return [
    (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
    (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w,
  ];
}

function collectPrimitives(node, parentMatrix, collected) {
  const matrix = multiplyMatrices(parentMatrix, node.getMatrix());
  const mesh = node.getMesh();

  if (mesh) {
    for (const primitive of mesh.listPrimitives()) {
      collected.push({ primitive, matrix });
    }
  }

  for (const child of node.listChildren()) {
    collectPrimitives(child, matrix, collected);
  }
}

const IDENTITY = new Float32Array([
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
]);

async function buildGeometry(path) {
  const document = await io.read(path);
  const collected = [];

  for (const scene of document.getRoot().listScenes()) {
    for (const node of scene.listChildren()) {
      collectPrimitives(node, IDENTITY, collected);
    }
  }

  let totalVertices = 0;
  let totalIndices = 0;
  const parts = [];

  for (const { primitive, matrix } of collected) {
    const positionAccessor = primitive.getAttribute('POSITION');
    if (!positionAccessor) {
      continue;
    }
    const positions = positionAccessor.getArray();
    const vertexCount = positionAccessor.getCount();
    const indexAccessor = primitive.getIndices();
    const indices = indexAccessor
      ? indexAccessor.getArray()
      : Uint32Array.from({ length: vertexCount }, (_unused, i) => i);

    parts.push({
      positions,
      indices,
      matrix,
      vertexCount,
    });
    totalVertices += vertexCount;
    totalIndices += indices.length;
  }

  if (parts.length === 0) {
    return null;
  }

  const positions = new Float32Array(totalVertices * 3);
  const indices = new Uint32Array(totalIndices);

  let vertexOffset = 0;
  let indexOffset = 0;

  for (const part of parts) {
    for (let i = 0; i < part.vertexCount; i += 1) {
      const target = (vertexOffset + i) * 3;
      const source = i * 3;
      const [x, y, z] = transformPoint(
        part.matrix,
        part.positions[source],
        part.positions[source + 1],
        part.positions[source + 2],
      );
      positions[target] = x;
      positions[target + 1] = y;
      positions[target + 2] = z;

    }

    for (let i = 0; i < part.indices.length; i += 1) {
      indices[indexOffset + i] = part.indices[i] + vertexOffset;
    }

    vertexOffset += part.vertexCount;
    indexOffset += part.indices.length;
  }

  return { positions, indices };
}

// Positions go through the vertex codec unfiltered. Any lossy filter here
// reaches the normals, which normalizeGeometry derives from these positions
// and the halftone pass turns into line density: encodeFilterExp at 15 bits
// measured 24.8 degrees of normal error on the padlock, and 2.95 on the
// diamond. The codec alone costs about 25% over the source glb and holds the
// error at 0.02 degrees, which is float32 round-trip noise.
function encodeGeometry({ positions, indices }) {
  const vertexCount = positions.length / 3;

  const positionBlob = MeshoptEncoder.encodeVertexBuffer(
    new Uint8Array(positions.buffer, positions.byteOffset, positions.byteLength),
    vertexCount,
    12,
  );
  const indexBlob = MeshoptEncoder.encodeIndexBuffer(
    new Uint8Array(indices.buffer, indices.byteOffset, indices.byteLength),
    indices.length,
    4,
  );

  const header = 24;
  const buffer = Buffer.alloc(
    header + positionBlob.length + indexBlob.length,
  );

  buffer.write('TWGE', 0, 'ascii');
  buffer.writeUInt32LE(GEOMETRY_VERSION, 4);
  buffer.writeUInt32LE(vertexCount, 8);
  buffer.writeUInt32LE(indices.length, 12);
  buffer.writeUInt32LE(positionBlob.length, 16);
  buffer.writeUInt32LE(indexBlob.length, 20);

  let offset = header;
  for (const blob of [positionBlob, indexBlob]) {
    Buffer.from(blob.buffer, blob.byteOffset, blob.length).copy(buffer, offset);
    offset += blob.length;
  }

  return buffer;
}

const files = (await readdir(SOURCE_DIR)).filter((name) =>
  name.endsWith('.glb'),
);

await mkdir(OUTPUT_DIR, { recursive: true });

async function convert(name) {
  const path = join(SOURCE_DIR, name);
  const geometry = await buildGeometry(path);

  if (!geometry) {
    console.warn(`  ${name.padEnd(22)} no mesh geometry, skipped`);
    return null;
  }

  const outputName = name.replace(/\.glb$/, '.geo');
  const buffer = gzipSync(encodeGeometry(geometry), { level: 9 });
  const [, sourceStat] = await Promise.all([
    writeFile(join(OUTPUT_DIR, outputName), buffer),
    stat(path),
  ]);

  return {
    outputName,
    vertexCount: geometry.positions.length / 3,
    sourceBytes: sourceStat.size,
    outputBytes: buffer.byteLength,
  };
}

const results = (await Promise.all(files.map(convert))).filter(Boolean);

let sourceBytes = 0;
let outputBytes = 0;

for (const result of results.toSorted((a, b) =>
  a.outputName.localeCompare(b.outputName),
)) {
  sourceBytes += result.sourceBytes;
  outputBytes += result.outputBytes;
  console.log(
    `  ${result.outputName.padEnd(22)} ${result.vertexCount.toString().padStart(7)} verts ${kilobytes(result.outputBytes).padStart(8)}`,
  );
}

console.log(
  `geometry: ${kilobytes(sourceBytes)} of glb -> ${kilobytes(outputBytes)} of gzipped geo`,
);
