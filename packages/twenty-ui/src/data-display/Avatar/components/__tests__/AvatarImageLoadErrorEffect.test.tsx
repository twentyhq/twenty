import { act, render } from '@testing-library/react';

import { AvatarImageLoadErrorEffect } from '@ui/data-display/Avatar/components/AvatarImageLoadErrorEffect';

class MockImage {
  static instances: MockImage[] = [];

  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    MockImage.instances.push(this);
  }
}

describe('AvatarImageLoadErrorEffect', () => {
  const originalImage = window.Image;

  beforeEach(() => {
    MockImage.instances = [];
    window.Image = MockImage as unknown as typeof Image;
  });

  afterEach(() => {
    window.Image = originalImage;
  });

  it('should call onImageLoadError with the URI only after the probe errors', () => {
    const onImageLoadError = jest.fn();

    render(
      <AvatarImageLoadErrorEffect
        avatarImageURI="https://a.com/broken.png"
        onImageLoadError={onImageLoadError}
      />,
    );

    expect(onImageLoadError).not.toHaveBeenCalled();

    act(() => {
      MockImage.instances[0].onerror?.();
    });

    expect(onImageLoadError).toHaveBeenCalledWith('https://a.com/broken.png');
  });

  it('should detach the error handler and abort the probe on unmount', () => {
    const onImageLoadError = jest.fn();

    const { unmount } = render(
      <AvatarImageLoadErrorEffect
        avatarImageURI="https://a.com/icon.png"
        onImageLoadError={onImageLoadError}
      />,
    );

    unmount();

    expect(MockImage.instances[0].onerror).toBeNull();
    expect(MockImage.instances[0].src).toBe('');
  });
});
