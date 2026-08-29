// Bakes three's RoomEnvironment into a prefiltered equirectangular radiance
// map, replacing PMREMGenerator + RoomEnvironment at runtime.
//
// RoomEnvironment is a fixed set of boxes lit by one point light, and three
// re-derives the identical PMREM on every mount. Ray-tracing it here is exact
// (three renders it with no shadows and no bounces, so direct lighting is the
// whole image) and turns a per-mount GPU prefilter into a static asset.
//
// Output layout, little-endian: magic 'TWEN', uint32 mipCount, then per mip
// uint32 width, uint32 height, followed by width*height*4 half-floats RGBA.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE_WIDTH = 64;
const BASE_HEIGHT = 32;
const MIP_COUNT = 6;
const SAMPLES_PER_MIP = 256;
const BASE_SUPERSAMPLE = 8;

const OUTPUT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'images',
  'halftone',
  'room-environment.bin',
);

// Scene graph values copied from three/examples/jsm/environments/RoomEnvironment.js.
// The scene sits at y = -3.5, so the PMREM camera at the world origin is at
// (0, 3.5, 0) in room-local space.
const CAMERA = [0, 3.5, 0];

const LIGHT = {
  position: [0.418, 16.199, 0.3],
  intensity: 900,
  distance: 28,
  decay: 2,
};

const ROOM = {
  position: [-0.757, 13.219, 0.717],
  rotationY: 0,
  scale: [31.713, 28.305, 28.591],
  emissive: 0,
};

const BOXES = [
  { position: [-10.906, 2.009, 1.846], rotationY: -0.195, scale: [2.328, 7.905, 4.651], emissive: 0 },
  { position: [-5.607, -0.754, -0.758], rotationY: 0.994, scale: [1.97, 1.534, 3.955], emissive: 0 },
  { position: [6.167, 0.857, 7.803], rotationY: 0.561, scale: [3.927, 6.285, 3.687], emissive: 0 },
  { position: [-2.017, 0.018, 6.124], rotationY: 0.333, scale: [2.002, 4.566, 2.064], emissive: 0 },
  { position: [2.291, -0.756, -2.621], rotationY: -0.286, scale: [1.546, 1.552, 1.496], emissive: 0 },
  { position: [-2.193, -0.369, -5.547], rotationY: 0.516, scale: [3.875, 3.487, 2.986], emissive: 0 },
  { position: [-16.116, 14.37, 8.208], rotationY: 0, scale: [0.1, 2.428, 2.739], emissive: 50 },
  { position: [-16.109, 18.021, -8.207], rotationY: 0, scale: [0.1, 2.425, 2.751], emissive: 50 },
  { position: [14.904, 12.198, -1.832], rotationY: 0, scale: [0.15, 4.265, 6.331], emissive: 17 },
  { position: [-0.462, 8.89, 14.52], rotationY: 0, scale: [4.38, 5.441, 0.088], emissive: 43 },
  { position: [3.235, 11.486, -12.541], rotationY: 0, scale: [2.5, 2.0, 0.1], emissive: 20 },
  { position: [0.0, 20.0, 0.0], rotationY: 0, scale: [1.0, 0.1, 1.0], emissive: 100 },
];

function toLocal(box, point) {
  const cos = Math.cos(-box.rotationY);
  const sin = Math.sin(-box.rotationY);
  const x = point[0] - box.position[0];
  const y = point[1] - box.position[1];
  const z = point[2] - box.position[2];
  return [
    (x * cos - z * sin) / box.scale[0],
    y / box.scale[1],
    (x * sin + z * cos) / box.scale[2],
  ];
}

function rotateLocal(box, vector) {
  const cos = Math.cos(-box.rotationY);
  const sin = Math.sin(-box.rotationY);
  return [
    (vector[0] * cos - vector[2] * sin) / box.scale[0],
    vector[1] / box.scale[1],
    (vector[0] * sin + vector[2] * cos) / box.scale[2],
  ];
}

function normalToWorld(box, localNormal) {
  const nx = localNormal[0] / box.scale[0];
  const ny = localNormal[1] / box.scale[1];
  const nz = localNormal[2] / box.scale[2];
  const cos = Math.cos(box.rotationY);
  const sin = Math.sin(box.rotationY);
  const x = nx * cos - nz * sin;
  const z = nx * sin + nz * cos;
  const length = Math.hypot(x, ny, z) || 1;
  return [x / length, ny / length, z / length];
}

// Slab test against the unit cube BoxGeometry builds, in the box's own space.
// `wantExit` picks the far hit, which is what BackSide rendering shows for the
// room the camera sits inside.
function intersectBox(box, origin, direction, wantExit) {
  const localOrigin = toLocal(box, origin);
  const localDirection = rotateLocal(box, direction);

  let tMin = -Infinity;
  let tMax = Infinity;
  let minAxis = 0;
  let maxAxis = 0;

  for (let axis = 0; axis < 3; axis += 1) {
    const d = localDirection[axis];
    const o = localOrigin[axis];
    if (Math.abs(d) < 1e-12) {
      if (o < -0.5 || o > 0.5) {
        return null;
      }
      continue;
    }
    let tNear = (-0.5 - o) / d;
    let tFar = (0.5 - o) / d;
    if (tNear > tFar) {
      [tNear, tFar] = [tFar, tNear];
    }
    if (tNear > tMin) {
      tMin = tNear;
      minAxis = axis;
    }
    if (tFar < tMax) {
      tMax = tFar;
      maxAxis = axis;
    }
    if (tMin > tMax) {
      return null;
    }
  }

  const t = wantExit ? tMax : tMin;
  if (t <= 1e-6) {
    return null;
  }

  const axis = wantExit ? maxAxis : minAxis;
  const localNormal = [0, 0, 0];
  const localHit = localOrigin[axis] + localDirection[axis] * t;
  localNormal[axis] = localHit > 0 ? 1 : -1;
  if (wantExit) {
    localNormal[axis] *= -1;
  }

  return { t, normal: normalToWorld(box, localNormal) };
}

// three's getDistanceAttenuation for a physical point light.
function distanceAttenuation(distance) {
  const falloff = 1 / Math.max(Math.pow(distance, LIGHT.decay), 0.01);
  const ratio = distance / LIGHT.distance;
  const cutoff = Math.max(1 - ratio * ratio * ratio * ratio, 0);
  return falloff * Math.min(cutoff * cutoff, 1);
}

// MeshStandardMaterial defaults: white base colour, metalness 0, roughness 1.
// three renders this scene with no shadow maps and no bounces, so a surface's
// radiance is one Lambert term from the point light.
function shadeSurface(hitPoint, normal) {
  const toLight = [
    LIGHT.position[0] - hitPoint[0],
    LIGHT.position[1] - hitPoint[1],
    LIGHT.position[2] - hitPoint[2],
  ];
  const distance = Math.hypot(toLight[0], toLight[1], toLight[2]) || 1e-6;
  const dotNL = Math.max(
    (toLight[0] * normal[0] + toLight[1] * normal[1] + toLight[2] * normal[2]) /
      distance,
    0,
  );
  return (
    (dotNL * LIGHT.intensity * distanceAttenuation(distance)) / Math.PI
  );
}

function traceRadiance(direction) {
  let closest = Infinity;
  let radiance = 0;

  const roomHit = intersectBox(ROOM, CAMERA, direction, true);
  if (roomHit) {
    closest = roomHit.t;
    radiance = shadeSurface(
      [
        CAMERA[0] + direction[0] * roomHit.t,
        CAMERA[1] + direction[1] * roomHit.t,
        CAMERA[2] + direction[2] * roomHit.t,
      ],
      roomHit.normal,
    );
  }

  for (const box of BOXES) {
    const hit = intersectBox(box, CAMERA, direction, false);
    if (!hit || hit.t >= closest) {
      continue;
    }
    closest = hit.t;
    radiance = box.emissive
      ? box.emissive
      : shadeSurface(
          [
            CAMERA[0] + direction[0] * hit.t,
            CAMERA[1] + direction[1] * hit.t,
            CAMERA[2] + direction[2] * hit.t,
          ],
          hit.normal,
        );
  }

  return radiance;
}

// Matches directionToEquirectUv in the halftone shaders.
function directionFromUv(u, v) {
  const phi = (u - 0.5) * 2 * Math.PI;
  const theta = (1 - v - 0.5) * Math.PI;
  const cosTheta = Math.cos(theta);
  return [cosTheta * Math.cos(phi), Math.sin(theta), cosTheta * Math.sin(phi)];
}

// Supersampled: the ceiling emitter is a 1 x 0.1 x 1 box subtending well under
// one texel at the base resolution, and a single centre ray misses it entirely.
function renderBase() {
  const pixels = new Float32Array(BASE_WIDTH * BASE_HEIGHT);
  const step = 1 / BASE_SUPERSAMPLE;
  const sampleCount = BASE_SUPERSAMPLE * BASE_SUPERSAMPLE;

  for (let y = 0; y < BASE_HEIGHT; y += 1) {
    for (let x = 0; x < BASE_WIDTH; x += 1) {
      let total = 0;
      for (let sy = 0; sy < BASE_SUPERSAMPLE; sy += 1) {
        for (let sx = 0; sx < BASE_SUPERSAMPLE; sx += 1) {
          total += traceRadiance(
            directionFromUv(
              (x + (sx + 0.5) * step) / BASE_WIDTH,
              (y + (sy + 0.5) * step) / BASE_HEIGHT,
            ),
          );
        }
      }
      pixels[y * BASE_WIDTH + x] = total / sampleCount;
    }
  }
  return pixels;
}

function hammersley(index, count) {
  let bits = index;
  bits = (bits << 16) | (bits >>> 16);
  bits = ((bits & 0x55555555) << 1) | ((bits & 0xaaaaaaaa) >>> 1);
  bits = ((bits & 0x33333333) << 2) | ((bits & 0xcccccccc) >>> 2);
  bits = ((bits & 0x0f0f0f0f) << 4) | ((bits & 0xf0f0f0f0) >>> 4);
  bits = ((bits & 0x00ff00ff) << 8) | ((bits & 0xff00ff00) >>> 8);
  return [index / count, (bits >>> 0) * 2.3283064365386963e-10];
}

function importanceSampleGgx(u1, u2, roughness, normal) {
  const alpha = roughness * roughness;
  const phi = 2 * Math.PI * u1;
  const cosTheta = Math.sqrt((1 - u2) / (1 + (alpha * alpha - 1) * u2));
  const sinTheta = Math.sqrt(Math.max(1 - cosTheta * cosTheta, 0));

  const up = Math.abs(normal[1]) < 0.999 ? [0, 1, 0] : [1, 0, 0];
  const tangentX = [
    up[1] * normal[2] - up[2] * normal[1],
    up[2] * normal[0] - up[0] * normal[2],
    up[0] * normal[1] - up[1] * normal[0],
  ];
  const tangentLength = Math.hypot(...tangentX) || 1;
  const tx = tangentX.map((component) => component / tangentLength);
  const ty = [
    normal[1] * tx[2] - normal[2] * tx[1],
    normal[2] * tx[0] - normal[0] * tx[2],
    normal[0] * tx[1] - normal[1] * tx[0],
  ];

  const hx = sinTheta * Math.cos(phi);
  const hy = sinTheta * Math.sin(phi);

  return [
    tx[0] * hx + ty[0] * hy + normal[0] * cosTheta,
    tx[1] * hx + ty[1] * hy + normal[1] * cosTheta,
    tx[2] * hx + ty[2] * hy + normal[2] * cosTheta,
  ];
}

function sampleBilinear(pixels, width, height, direction) {
  const u =
    (Math.atan2(direction[2], direction[0]) * 0.15915494309189535 + 0.5) % 1;
  const rawV =
    Math.asin(Math.max(Math.min(direction[1], 1), -1)) * 0.3183098861837907 +
    0.5;
  const v = 1 - Math.max(Math.min(rawV, 1), 0);

  const x = u * width - 0.5;
  const y = v * height - 0.5;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;

  const at = (px, py) => {
    const wrappedX = ((px % width) + width) % width;
    const clampedY = Math.max(Math.min(py, height - 1), 0);
    return pixels[clampedY * width + wrappedX];
  };

  return (
    at(x0, y0) * (1 - fx) * (1 - fy) +
    at(x0 + 1, y0) * fx * (1 - fy) +
    at(x0, y0 + 1) * (1 - fx) * fy +
    at(x0 + 1, y0 + 1) * fx * fy
  );
}

// Split-sum prefilter: mip N holds the radiance a surface of roughness
// N/(MIP_COUNT-1) reflects, which is what PMREM's mip chain encodes.
function prefilter(basePixels, level) {
  const width = Math.max(BASE_WIDTH >> level, 1);
  const height = Math.max(BASE_HEIGHT >> level, 1);
  const roughness = level / (MIP_COUNT - 1);
  const pixels = new Float32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const normal = directionFromUv((x + 0.5) / width, (y + 0.5) / height);
      if (roughness === 0) {
        pixels[y * width + x] = sampleBilinear(
          basePixels,
          BASE_WIDTH,
          BASE_HEIGHT,
          normal,
        );
        continue;
      }

      let total = 0;
      let weight = 0;
      for (let index = 0; index < SAMPLES_PER_MIP; index += 1) {
        const [u1, u2] = hammersley(index, SAMPLES_PER_MIP);
        const half = importanceSampleGgx(u1, u2, roughness, normal);
        const dotNH =
          normal[0] * half[0] + normal[1] * half[1] + normal[2] * half[2];
        const light = [
          2 * dotNH * half[0] - normal[0],
          2 * dotNH * half[1] - normal[1],
          2 * dotNH * half[2] - normal[2],
        ];
        const dotNL =
          normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2];
        if (dotNL <= 0) {
          continue;
        }
        total +=
          sampleBilinear(basePixels, BASE_WIDTH, BASE_HEIGHT, light) * dotNL;
        weight += dotNL;
      }
      pixels[y * width + x] = weight > 0 ? total / weight : 0;
    }
  }

  return { width, height, pixels };
}

function toHalf(value) {
  const floatView = new Float32Array(1);
  const intView = new Uint32Array(floatView.buffer);
  floatView[0] = value;
  const bits = intView[0];
  const sign = (bits >>> 16) & 0x8000;
  let exponent = (bits >>> 23) & 0xff;
  let mantissa = bits & 0x7fffff;

  if (exponent === 0xff) {
    return sign | 0x7c00 | (mantissa ? 0x200 : 0);
  }
  exponent = exponent - 127 + 15;
  if (exponent >= 0x1f) {
    return sign | 0x7c00;
  }
  if (exponent <= 0) {
    if (exponent < -10) {
      return sign;
    }
    mantissa |= 0x800000;
    const shift = 14 - exponent;
    return sign | (mantissa >>> shift);
  }
  return sign | (exponent << 10) | (mantissa >>> 13);
}

const basePixels = renderBase();
const mips = Array.from({ length: MIP_COUNT }, (_unused, level) =>
  prefilter(basePixels, level),
);

let byteLength = 8 + mips.length * 8;
for (const mip of mips) {
  byteLength += mip.width * mip.height * 4 * 2;
}

const buffer = Buffer.alloc(byteLength);
buffer.write('TWEN', 0, 'ascii');
buffer.writeUInt32LE(mips.length, 4);

let offset = 8;
for (const mip of mips) {
  buffer.writeUInt32LE(mip.width, offset);
  buffer.writeUInt32LE(mip.height, offset + 4);
  offset += 8;
  for (const value of mip.pixels) {
    const half = toHalf(value);
    buffer.writeUInt16LE(half, offset);
    buffer.writeUInt16LE(half, offset + 2);
    buffer.writeUInt16LE(half, offset + 4);
    buffer.writeUInt16LE(toHalf(1), offset + 6);
    offset += 8;
  }
}

await writeFile(OUTPUT_PATH, buffer);

const peak = Math.max(...basePixels);
const mean = basePixels.reduce((sum, value) => sum + value, 0) / basePixels.length;
console.log(
  `room-environment.bin  ${mips.length} mips  ${Math.round(byteLength / 1024)}KB  peak=${peak.toFixed(2)} mean=${mean.toFixed(3)}`,
);
