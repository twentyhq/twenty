import { deepSizeBytes } from 'src/engine/workspace-cache/utils/deep-size-bytes.util';

const CAP = 300_000;

describe('deepSizeBytes', () => {
  it('sizes primitives', () => {
    expect(deepSizeBytes(42, CAP)).toBe(8);
    expect(deepSizeBytes(true, CAP)).toBe(4);
    expect(deepSizeBytes(null, CAP)).toBe(0);
    expect(deepSizeBytes('ab', CAP)).toBe(12 + 2 * 2);
  });

  it('walks nested objects, arrays, Maps and Sets', () => {
    const withArray = deepSizeBytes({ items: [1, 2, 3] }, CAP);
    const withoutArray = deepSizeBytes({ items: [] }, CAP);

    expect(withArray).toBeGreaterThan(withoutArray);
    expect(deepSizeBytes(new Map([['k', 'v']]), CAP)).toBeGreaterThan(0);
    expect(deepSizeBytes(new Set([1, 2, 3]), CAP)).toBeGreaterThan(0);
  });

  it('is cycle-safe: a self-referential graph terminates and counts each object once', () => {
    const a: Record<string, unknown> = {};
    const b: Record<string, unknown> = { a };

    a.b = b;

    const cyclic = deepSizeBytes(a, CAP);
    // Same two objects, no cycle — the cyclic walk must not double-count.
    const acyclic = deepSizeBytes({ b: { value: 1 } }, CAP);

    expect(Number.isFinite(cyclic)).toBe(true);
    expect(cyclic).toBeGreaterThan(0);
    expect(cyclic).toBeLessThan(acyclic + 100);
  });

  it('stops at the node cap so a large graph cannot run unbounded', () => {
    const big = Array.from({ length: 10_000 }, (_, index) => ({ index }));

    const capped = deepSizeBytes(big, 5);
    const full = deepSizeBytes(big, CAP);

    expect(capped).toBeLessThan(full);
  });
});
