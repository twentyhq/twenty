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

  it('should report an error only after the probed image fails to load', () => {
    const { result } = renderHook(() =>
      useImageLoadErrorProbe('https://a.com/broken.png'),
    );

    expect(result.current).toBe(false);

    act(() => {
      MockImage.instances[0].onerror?.();
    });

    expect(result.current).toBe(true);
  });

  it('should reset the error when the URI changes to a new image', () => {
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
});
