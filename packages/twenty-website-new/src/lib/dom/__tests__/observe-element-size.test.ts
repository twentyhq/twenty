import {
  observeElementSize,
  observeElementsSize,
} from '../observe-element-size';

type GlobalWithResizeObserver = typeof globalThis & {
  ResizeObserver?: typeof ResizeObserver;
  window?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
};

const getGlobalWithResizeObserver = () =>
  globalThis as GlobalWithResizeObserver;

describe('observeElementSize', () => {
  const originalResizeObserver = getGlobalWithResizeObserver().ResizeObserver;
  const originalWindow = getGlobalWithResizeObserver().window;

  afterEach(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: originalResizeObserver,
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });

    jest.restoreAllMocks();
  });

  it('uses ResizeObserver when available', () => {
    const disconnect = jest.fn();
    const observe = jest.fn();
    const element = {} as Element;

    class MockResizeObserver {
      observe = observe;
      disconnect = disconnect;
    }

    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: MockResizeObserver,
    });

    const stopObserving = observeElementSize(element, jest.fn());

    expect(observe).toHaveBeenCalledWith(element);

    stopObserving();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('observes multiple elements through one ResizeObserver', () => {
    const disconnect = jest.fn();
    const observe = jest.fn();
    const elements = [{} as Element, {} as Element];

    class MockResizeObserver {
      observe = observe;
      disconnect = disconnect;
    }

    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: MockResizeObserver,
    });

    const stopObserving = observeElementsSize(elements, jest.fn());

    expect(observe).toHaveBeenCalledTimes(2);
    expect(observe).toHaveBeenNthCalledWith(1, elements[0]);
    expect(observe).toHaveBeenNthCalledWith(2, elements[1]);

    stopObserving();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('falls back to window resize events when ResizeObserver is unavailable', () => {
    const onResize = jest.fn();
    const element = {} as Element;
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        addEventListener,
        removeEventListener,
      },
    });

    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: undefined,
    });

    const stopObserving = observeElementSize(element, onResize);

    expect(addEventListener).toHaveBeenCalledWith('resize', onResize);

    const resizeListener = addEventListener.mock.calls[0]?.[1] as () => void;
    resizeListener();

    expect(onResize).toHaveBeenCalledTimes(1);

    stopObserving();

    expect(removeEventListener).toHaveBeenCalledWith('resize', onResize);
  });
});
