import { createBoundedFailureCache } from './bounded-failure-cache';

describe('createBoundedFailureCache', () => {
  it('should remember added urls', () => {
    const cache = createBoundedFailureCache(2);
    cache.add('/a.glb');
    expect(cache.has('/a.glb')).toBe(true);
    expect(cache.has('/b.glb')).toBe(false);
  });

  it('should evict the oldest entry at capacity', () => {
    const cache = createBoundedFailureCache(2);
    cache.add('/a.glb');
    cache.add('/b.glb');
    cache.add('/c.glb');
    expect(cache.has('/a.glb')).toBe(false);
    expect(cache.has('/b.glb')).toBe(true);
    expect(cache.has('/c.glb')).toBe(true);
  });

  it('should treat re-adding as a no-op (insertion order is not refreshed)', () => {
    const cache = createBoundedFailureCache(2);
    cache.add('/a.glb');
    cache.add('/b.glb');
    cache.add('/a.glb');
    cache.add('/c.glb');
    expect(cache.has('/a.glb')).toBe(false);
    expect(cache.has('/b.glb')).toBe(true);
    expect(cache.has('/c.glb')).toBe(true);
  });

  it('should reject a non-positive size', () => {
    expect(() => createBoundedFailureCache(0)).toThrow();
  });
});
