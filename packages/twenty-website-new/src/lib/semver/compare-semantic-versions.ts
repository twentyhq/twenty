/**
 * SemVer 2.0.0 precedence comparator.
 *
 * Returns a sort-compatible integer:
 *   `< 0` if `a < b`, `0` if equal precedence, `> 0` if `a > b`.
 *
 * The previous implementation collapsed every non-numeric segment to `0` via
 * `Number(x) || 0` and then used `b.length - a.length` as the tiebreaker, so
 * `1.0.0-alpha` compared equal to `1.0.0` and `1.0` sorted above `1.0.0`.
 * Both behaviours silently mis-ordered the public release feed (which is
 * driven by this comparator via `lib/releases/`).
 *
 * Implements the SemVer 2.0.0 precedence rules verbatim
 * (https://semver.org/#spec-item-11):
 *   1. Strip an optional leading `v`.
 *   2. Split off `+build` (build metadata is ignored for precedence).
 *   3. Split `<core>-<pre>` on the first `-`.
 *   4. Compare core (major.minor.patch) numerically; missing parts read as 0.
 *   5. A version with no pre-release > a version with a pre-release.
 *   6. Pre-release identifiers compare left-to-right; numeric identifiers
 *      compare numerically and have lower precedence than alphanumerics
 *      (`1.0.0-alpha < 1.0.0-alpha.1` is wrong; the spec orders numeric
 *      identifiers _below_ alphanumeric ones — see §11 rule 4).
 */
export function compareSemanticVersions(a: string, b: string): number {
  return compareParsed(parseSemver(a), parseSemver(b));
}

type ParsedSemver = {
  core: number[];
  pre: string[] | null;
};

function parseSemver(version: string): ParsedSemver {
  const trimmed = version.trim().replace(/^v/i, '');
  // Build metadata (`+...`) is ignored for precedence per §10 of the spec.
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

  // Spec §11 rule 3: a version without a pre-release has higher precedence
  // than one with a pre-release.
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

    // Spec §11 rule 4.3: numeric identifiers have lower precedence than
    // alphanumeric identifiers.
    if (leftIsNumeric) return -1;
    if (rightIsNumeric) return 1;

    if (left !== right) return left < right ? -1 : 1;
  }

  // Spec §11 rule 4.4: a longer pre-release set has higher precedence when
  // all preceding identifiers are equal.
  if (a.length === b.length) return 0;
  return a.length < b.length ? -1 : 1;
}
