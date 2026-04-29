import { observeElementVisibility } from '../observe-element-visibility';

type GlobalWithIntersectionObserver = typeof globalThis & {
  IntersectionObserver?: typeof IntersectionObserver;
};

const getGlobalWithIntersectionObserver = () =>
  globalThis as GlobalWithIntersectionObserver;

describe('observeElementVisibility', () => {
  const originalIntersectionObserver =
    getGlobalWithIntersectionObserver().IntersectionObserver;

  afterEach(() => {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: originalIntersectionObserver,
    });

    jest.restoreAllMocks();
  });

  it('uses IntersectionObserver when available', () => {
    const disconnect = jest.fn();
    const observe = jest.fn();
    const element = {} as Element;

    class MockIntersectionObserver {
      observe = observe;
      disconnect = disconnect;
    }

    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: MockIntersectionObserver,
    });

    const stopObserving = observeElementVisibility(element, jest.fn(), {
      rootMargin: '100px',
    });

    expect(observe).toHaveBeenCalledWith(element);

    stopObserving();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('falls back to a visible state when IntersectionObserver is unavailable', () => {
    const onVisibilityChange = jest.fn();

    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: undefined,
    });

    const stopObserving = observeElementVisibility(
      {} as Element,
      onVisibilityChange,
    );

    expect(onVisibilityChange).toHaveBeenCalledWith(true);

    stopObserving();
  });
});
