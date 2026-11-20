// Reads a logo once to learn how to seat it.
// A "plate" logo ships its own opaque square (Call Recorder, Granola): it
// becomes the tile. A "glyph" has a transparent ground and sits on glass.
export type AppsStageLogoInk = {
  kind: 'plate' | 'glyph';
  // hex colour of the logo's light, empty when the logo cannot be read
  tint: string;
};

const SAMPLE_SIZE_PX = 24;
const OPAQUE_ALPHA = 245;
// Corners are skipped: a plate may round its own.
const EDGE_INSET = 5;
const PLATE_EDGE_SHARE = 0.96;

const UNREADABLE: AppsStageLogoInk = { kind: 'glyph', tint: '' };

const cache = new Map<string, Promise<AppsStageLogoInk>>();

const toHex = (channels: readonly number[]): string =>
  `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;

const analyse = (pixels: Uint8ClampedArray): AppsStageLogoInk => {
  const at = (x: number, y: number) => {
    const offset = (y * SAMPLE_SIZE_PX + x) * 4;

    return {
      red: pixels[offset],
      green: pixels[offset + 1],
      blue: pixels[offset + 2],
      alpha: pixels[offset + 3],
    };
  };

  const edge = [];
  const last = SAMPLE_SIZE_PX - 1;

  for (let step = EDGE_INSET; step < SAMPLE_SIZE_PX - EDGE_INSET; step++) {
    edge.push(at(step, 0), at(step, last), at(0, step), at(last, step));
  }

  const opaqueEdge = edge.filter((pixel) => pixel.alpha >= OPAQUE_ALPHA);

  if (opaqueEdge.length / edge.length >= PLATE_EDGE_SHARE) {
    return {
      kind: 'plate',
      tint: toHex([
        opaqueEdge.reduce((sum, pixel) => sum + pixel.red, 0) /
          opaqueEdge.length,
        opaqueEdge.reduce((sum, pixel) => sum + pixel.green, 0) /
          opaqueEdge.length,
        opaqueEdge.reduce((sum, pixel) => sum + pixel.blue, 0) /
          opaqueEdge.length,
      ]),
    };
  }

  // Vivid pixels weigh more, so a multicolour mark does not average to mud.
  let weightSum = 0;
  const sums = [0, 0, 0];

  for (let y = 0; y < SAMPLE_SIZE_PX; y++) {
    for (let x = 0; x < SAMPLE_SIZE_PX; x++) {
      const pixel = at(x, y);

      if (pixel.alpha < 128) {
        continue;
      }

      const spread =
        Math.max(pixel.red, pixel.green, pixel.blue) -
        Math.min(pixel.red, pixel.green, pixel.blue);
      const weight = 1 + (spread / 255) * 8;

      weightSum += weight;
      sums[0] += pixel.red * weight;
      sums[1] += pixel.green * weight;
      sums[2] += pixel.blue * weight;
    }
  }

  return weightSum === 0
    ? UNREADABLE
    : { kind: 'glyph', tint: toHex(sums.map((sum) => sum / weightSum)) };
};

const read = async (logoUrl: string): Promise<AppsStageLogoInk> => {
  try {
    const image = new Image();

    image.crossOrigin = 'anonymous';
    image.src = logoUrl;
    await image.decode();

    const canvas = document.createElement('canvas');

    canvas.width = SAMPLE_SIZE_PX;
    canvas.height = SAMPLE_SIZE_PX;

    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (context === null) {
      return UNREADABLE;
    }

    context.drawImage(image, 0, 0, SAMPLE_SIZE_PX, SAMPLE_SIZE_PX);

    return analyse(
      context.getImageData(0, 0, SAMPLE_SIZE_PX, SAMPLE_SIZE_PX).data,
    );
  } catch {
    // No CORS header or a broken file: the logo still shows, on plain glass.
    return UNREADABLE;
  }
};

export const readAppsStageLogoInk = (
  logoUrl: string,
): Promise<AppsStageLogoInk> => {
  const cached = cache.get(logoUrl);

  if (cached !== undefined) {
    return cached;
  }

  const pending = read(logoUrl);

  cache.set(logoUrl, pending);

  return pending;
};
