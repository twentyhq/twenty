function toPascalCase(value: string) {
  const tokens = value
    .replace(/\.[^.]+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const joined = tokens
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join('');

  if (!joined) {
    return 'HalftoneDashes';
  }

  return /^[A-Za-z_]/.test(joined) ? joined : `Halftone${joined}`;
}

export function normalizeExportComponentName(
  value: string | null | undefined,
  fallback = 'HalftoneDashes',
) {
  return toPascalCase(value?.trim() || fallback);
}

export function toKebabCase(value: string) {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized || 'halftone-dashes';
}

export function resolveExportArtifactNames(
  value: string | null | undefined,
  fallback = 'HalftoneDashes',
) {
  const componentName = normalizeExportComponentName(value, fallback);

  return {
    componentName,
    fileBaseName: toKebabCase(componentName),
  };
}
