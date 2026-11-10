import {
  resolveMaxAgeBoundedTtlMs,
  resolvePositiveTtlMs,
} from 'src/engine/workspace-cache/utils/resolve-positive-ttl-ms.util';

describe('resolvePositiveTtlMs', () => {
  it('converts a positive number of seconds', () => {
    expect(resolvePositiveTtlMs(120)).toBe(120_000);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, undefined, '60'])(
    'never returns a non-expiring ttl for %p',
    (ttlSeconds) => {
      expect(resolvePositiveTtlMs(ttlSeconds)).toBe(3_600_000);
    },
  );
});

describe('resolveMaxAgeBoundedTtlMs', () => {
  it('caps the storage ttl by the max age', () => {
    expect(
      resolveMaxAgeBoundedTtlMs({
        storageTtlSeconds: 604_800,
        maxAgeSeconds: 60,
      }),
    ).toBe(60_000);
  });

  it('keeps a storage ttl shorter than the max age', () => {
    expect(
      resolveMaxAgeBoundedTtlMs({ storageTtlSeconds: 30, maxAgeSeconds: 60 }),
    ).toBe(30_000);
  });

  it('treats an unbounded storage ttl as no cap', () => {
    expect(
      resolveMaxAgeBoundedTtlMs({ storageTtlSeconds: 0, maxAgeSeconds: 60 }),
    ).toBe(60_000);
  });

  it('never lets a zero max age make keys persistent', () => {
    expect(
      resolveMaxAgeBoundedTtlMs({ storageTtlSeconds: 0, maxAgeSeconds: 0 }),
    ).toBe(3_600_000);
  });
});
