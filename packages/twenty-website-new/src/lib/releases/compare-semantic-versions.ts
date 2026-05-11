export function compareSemanticVersions(a: string, b: string): number {
  return compareParsed(parseSemver(a), parseSemver(b));
}

type ParsedSemver = {
  core: number[];
  pre: string[] | null;
};

function parseSemver(version: string): ParsedSemver {
  const trimmed = version.trim().replace(/^v/i, '');
  const withoutBuild = trimmed.split('+', 1)[0] ?? '';

  const dashIndex = withoutBuild.indexOf('-');
  const coreString =
    dashIndex === -1 ? withoutBuild : withoutBuild.slice(0, dashIndex);
  const preString = dashIndex === -1 ? null : withoutBuild.slice(dashIndex + 1);

  const coreParts = coreString.split('.').map((part) => {
    const parsed = Number.parseInt(part, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  });

  return {
    core: coreParts,
    pre: preString === null || preString === '' ? null : preString.split('.'),
  };
}

function compareParsed(a: ParsedSemver, b: ParsedSemver): number {
  const length = Math.max(a.core.length, b.core.length);
  for (let i = 0; i < length; i++) {
    const left = a.core[i] ?? 0;
    const right = b.core[i] ?? 0;
    if (left !== right) {
      return left < right ? -1 : 1;
    }
  }

  if (a.pre === null && b.pre === null) return 0;
  if (a.pre === null) return 1;
  if (b.pre === null) return -1;

  return comparePreReleaseIdentifiers(a.pre, b.pre);
}

function comparePreReleaseIdentifiers(a: string[], b: string[]): number {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const left = a[i] ?? '';
    const right = b[i] ?? '';

    const leftIsNumeric = /^\d+$/.test(left);
    const rightIsNumeric = /^\d+$/.test(right);

    if (leftIsNumeric && rightIsNumeric) {
      const ln = Number.parseInt(left, 10);
      const rn = Number.parseInt(right, 10);
      if (ln !== rn) return ln < rn ? -1 : 1;
      continue;
    }

    if (leftIsNumeric) return -1;
    if (rightIsNumeric) return 1;

    if (left !== right) return left < right ? -1 : 1;
  }

  if (a.length === b.length) return 0;
  return a.length < b.length ? -1 : 1;
}
