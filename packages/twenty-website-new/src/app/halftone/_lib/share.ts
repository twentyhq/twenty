import {
  DEFAULT_GEOMETRY_SPECS,
  DEFAULT_HALFTONE_SETTINGS,
  normalizeHalftoneStudioSettings,
  type HalftoneStudioSettings,
} from '@/app/halftone/_lib/state';

export type ShareableHalftoneState = {
  settings: HalftoneStudioSettings;
  previewDistance: number;
  exportName: string;
};

function toUrlSafeBase64(input: string) {
  return input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(input: string) {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');

  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }

  return normalized;
}

function encodeUtf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function decodeBase64ToUtf8(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

export function encodeShareState(state: ShareableHalftoneState): string {
  const payload = {
    settings: state.settings,
    previewDistance: state.previewDistance,
    exportName: state.exportName,
  };

  return toUrlSafeBase64(encodeUtf8ToBase64(JSON.stringify(payload)));
}

// Imported geometry only exists in the user's local session, so a shared URL
// can never reproduce a custom upload — fall back to the default shape if the
// hash points at one.
function sanitizeShapeKey(shapeKey: string): string {
  const isBuiltinShape = DEFAULT_GEOMETRY_SPECS.some(
    (spec) => spec.key === shapeKey,
  );

  return isBuiltinShape ? shapeKey : DEFAULT_HALFTONE_SETTINGS.shapeKey;
}

export function decodeShareState(
  hash: string | null | undefined,
): ShareableHalftoneState | null {
  if (!hash) {
    return null;
  }

  const trimmed = hash.replace(/^#/, '').trim();

  if (!trimmed) {
    return null;
  }

  try {
    const json = decodeBase64ToUtf8(fromUrlSafeBase64(trimmed));
    const parsed = JSON.parse(json) as Partial<ShareableHalftoneState> | null;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const settings = normalizeHalftoneStudioSettings(parsed.settings);
    const previewDistance =
      typeof parsed.previewDistance === 'number' &&
      Number.isFinite(parsed.previewDistance)
        ? parsed.previewDistance
        : null;
    const exportName =
      typeof parsed.exportName === 'string' ? parsed.exportName : '';

    if (previewDistance === null) {
      return null;
    }

    return {
      settings: {
        ...settings,
        shapeKey: sanitizeShapeKey(settings.shapeKey),
      },
      previewDistance,
      exportName,
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(state: ShareableHalftoneState): string {
  const hash = encodeShareState(state);
  const { origin, pathname } = window.location;

  return `${origin}${pathname}#${hash}`;
}
