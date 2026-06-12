import { compareSemanticVersions } from '@/lib/releases/compare-semantic-versions';

function expectOrdered(versions: string[]) {
  for (let i = 0; i < versions.length - 1; i++) {
    const a = versions[i];
    const b = versions[i + 1];
    expect(compareSemanticVersions(a, b)).toBeLessThan(0);
    expect(compareSemanticVersions(b, a)).toBeGreaterThan(0);
  }
  for (const v of versions) {
    expect(compareSemanticVersions(v, v)).toBe(0);
  }
}

describe('compareSemanticVersions', () => {
  it('orders core (major.minor.patch) numerically', () => {
    expectOrdered(['1.0.0', '1.0.1', '1.1.0', '2.0.0']);
    expectOrdered(['1.99.99', '2.0.0']);
  });

  it('treats missing core parts as 0 (1.0 ≡ 1.0.0)', () => {
    expect(compareSemanticVersions('1.0', '1.0.0')).toBe(0);
    expect(compareSemanticVersions('1', '1.0.0')).toBe(0);
  });

  it('ignores a leading "v"', () => {
    expect(compareSemanticVersions('v1.2.3', '1.2.3')).toBe(0);
    expect(compareSemanticVersions('V1.2.3', '1.2.3')).toBe(0);
  });

  it('ranks any pre-release below the same core release', () => {
    expectOrdered(['1.0.0-alpha', '1.0.0']);
    expectOrdered(['1.0.0-rc.1', '1.0.0']);
  });

  it('orders pre-release identifiers per the SemVer 2.0.0 spec example', () => {
    expectOrdered([
      '1.0.0-alpha',
      '1.0.0-alpha.1',
      '1.0.0-alpha.beta',
      '1.0.0-beta',
      '1.0.0-beta.2',
      '1.0.0-beta.11',
      '1.0.0-rc.1',
      '1.0.0',
    ]);
  });

  it('compares numeric identifiers numerically (alpha.2 < alpha.11)', () => {
    expect(
      compareSemanticVersions('1.0.0-alpha.2', '1.0.0-alpha.11'),
    ).toBeLessThan(0);
  });

  it('treats numeric identifiers as lower precedence than alphanumeric', () => {
    expect(
      compareSemanticVersions('1.0.0-alpha.1', '1.0.0-alpha.beta'),
    ).toBeLessThan(0);
  });

  it('ignores +build metadata for precedence', () => {
    expect(
      compareSemanticVersions('1.0.0+sha.deadbeef', '1.0.0+sha.cafebabe'),
    ).toBe(0);
    expect(compareSemanticVersions('1.0.0+a', '1.0.0')).toBe(0);
  });

  it('returns sort-stable values for identical inputs', () => {
    expect(compareSemanticVersions('1.2.3', '1.2.3')).toBe(0);
    expect(compareSemanticVersions('1.2.3-rc.1', '1.2.3-rc.1')).toBe(0);
  });

  it('sorts a real-world release feed (descending = newest first)', () => {
    const ascending = [
      '0.9.0',
      '1.0.0-alpha',
      '1.0.0-alpha.1',
      '1.0.0-beta',
      '1.0.0-rc.1',
      '1.0.0',
      '1.0.1',
      '1.1.0',
      '2.0.0-rc.1',
      '2.0.0',
    ];
    const shuffled = [...ascending].reverse();
    shuffled.sort((a, b) => compareSemanticVersions(a, b));
    expect(shuffled).toEqual(ascending);
  });
});
