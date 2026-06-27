import { findActiveSurfaceScheme } from './find-active-surface-scheme';

describe('findActiveSurfaceScheme', () => {
  it('should return the scheme of the surface spanning the line', () => {
    expect(
      findActiveSurfaceScheme(
        [
          { top: -200, bottom: 40, scheme: 'light' },
          { top: 40, bottom: 600, scheme: 'dark' },
        ],
        64,
      ),
    ).toBe('dark');
  });

  it('should treat the top edge as inclusive and the bottom edge as exclusive', () => {
    expect(
      findActiveSurfaceScheme(
        [
          { top: 0, bottom: 64, scheme: 'light' },
          { top: 64, bottom: 400, scheme: 'dark' },
        ],
        64,
      ),
    ).toBe('dark');
  });

  it('should return the first matching surface in document order', () => {
    expect(
      findActiveSurfaceScheme(
        [
          { top: 0, bottom: 200, scheme: 'light' },
          { top: 50, bottom: 300, scheme: 'dark' },
        ],
        64,
      ),
    ).toBe('light');
  });

  it('should return null when no surface spans the line', () => {
    expect(
      findActiveSurfaceScheme([{ top: 100, bottom: 500, scheme: 'muted' }], 64),
    ).toBeNull();
  });

  it('should return null when the spanning surface declares no scheme', () => {
    expect(
      findActiveSurfaceScheme([{ top: 0, bottom: 400, scheme: null }], 64),
    ).toBeNull();
  });
});
