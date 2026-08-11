import { act, renderHook } from '@testing-library/react';

import { useImageLoadErrorProbe } from '@ui/data-display/Avatar/hooks/useImageLoadErrorProbe';

class MockImage {
  static instances: MockImage[] = [];

  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    MockImage.instances.push(this);
  }
}

describe('useImageLoadErrorProbe', () => {
  const originalImage = window.Image;

  beforeEach(() => {
    MockImage.instances = [];
    window.Image = MockImage as unknown as typeof Image;
  });

  afterEach(() => {
    window.Image = originalImage;
  });

  it('should return false for a null URI without probing', () => {
    const { result } = renderHook(() => useImageLoadErrorProbe(null));

    expect(result.current).toBe(false);
    expect(MockImage.instances).toHaveLength(0);
  });

  it('should return false while the probe has not errored', () => {
    const { result } = renderHook(() =>
      useImageLoadErrorProbe('https://a.com/icon.png'),
    );

    expect(result.current).toBe(false);
    expect(MockImage.instances).toHaveLength(1);
    expect(MockImage.instances[0].src).toBe('https://a.com/icon.png');
  });

  it('should return true once the probe errors', () => {
    const { result } = renderHook(() =>
      useImageLoadErrorProbe('https://a.com/broken.png'),
    );

    act(() => {
      MockImage.instances[0].onerror?.();
    });

    expect(result.current).toBe(true);
  });

  it('should reset when the URI changes to a new image', () => {
    const { result, rerender } = renderHook(
      ({ uri }: { uri: string }) => useImageLoadErrorProbe(uri),
      { initialProps: { uri: 'https://a.com/broken.png' } },
    );

    act(() => {
      MockImage.instances[0].onerror?.();
    });
    expect(result.current).toBe(true);

    rerender({ uri: 'https://a.com/other.png' });

    expect(result.current).toBe(false);
  });

  it('should detach the error handler on unmount', () => {
    const { unmount } = renderHook(() =>
      useImageLoadErrorProbe('https://a.com/icon.png'),
    );

    unmount();

    expect(MockImage.instances[0].onerror).toBeNull();
  });
});
