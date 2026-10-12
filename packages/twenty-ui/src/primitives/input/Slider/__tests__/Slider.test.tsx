import { act, cleanup, render } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Slider } from '../Slider';
import styles from '../Slider.module.scss';

const RootWrapper = ({ children }: { children: ReactNode }) => (
  <Slider.Root defaultValue={40}>{children}</Slider.Root>
);

const ControlWrapper = ({ children }: { children: ReactNode }) => (
  <RootWrapper>
    <Slider.Control>{children}</Slider.Control>
  </RootWrapper>
);

runComponentConformance({
  name: 'Slider.Root',
  element: <Slider.Root defaultValue={40} />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});

runComponentConformance({
  name: 'Slider.Control',
  element: <Slider.Control />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.control,
  wrapper: RootWrapper,
});

runComponentConformance({
  name: 'Slider.Track',
  element: <Slider.Track />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.track,
  wrapper: ControlWrapper,
});

runComponentConformance({
  name: 'Slider.Indicator',
  element: <Slider.Indicator />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.indicator,
  wrapper: ControlWrapper,
});

runComponentConformance({
  name: 'Slider.Thumb',
  element: <Slider.Thumb aria-label="Volume" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.thumb,
  wrapper: ControlWrapper,
  // Base UI forwards the accessible name to the nested range input.
  skip: ['ariaAttributes'],
});

runComponentConformance({
  name: 'Slider.Label',
  element: <Slider.Label>Volume</Slider.Label>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.label,
  wrapper: RootWrapper,
});

runComponentConformance({
  name: 'Slider.Value',
  element: <Slider.Value />,
  refInstanceOf: HTMLOutputElement,
  ownClassName: styles.value,
  wrapper: RootWrapper,
});

describe('Slider measurement registration', () => {
  let controlWidth = 0;
  const observedElements = new Set<Element>();
  const resizeCallbacks = new Set<() => void>();

  beforeEach(() => {
    controlWidth = 0;
    observedElements.clear();
    resizeCallbacks.clear();

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        const width = this.classList.contains(styles.control)
          ? controlWidth
          : 16;

        return new DOMRect(0, 0, width, 16);
      },
    );

    class ResizeObserverStub {
      private readonly observedTargets = new Set<Element>();
      private readonly notify: () => void;

      constructor(callback: ResizeObserverCallback) {
        this.notify = () => callback([], this);
        resizeCallbacks.add(this.notify);
      }

      observe(target: Element) {
        this.observedTargets.add(target);
        observedElements.add(target);
      }

      unobserve(target: Element) {
        this.observedTargets.delete(target);
        observedElements.delete(target);
      }

      disconnect() {
        for (const target of this.observedTargets) {
          observedElements.delete(target);
        }

        this.observedTargets.clear();
        resizeCallbacks.delete(this.notify);
      }
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each(['edge', 'edge-client-only'] as const)(
    'positions %s thumbs when geometry arrives after mounting',
    async (thumbAlignment) => {
      const onValueChange = vi.fn();
      const onValueCommitted = vi.fn();
      const { container } = render(
        <Slider.Root
          defaultValue={40}
          thumbAlignment={thumbAlignment}
          onValueChange={onValueChange}
          onValueCommitted={onValueCommitted}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
              <Slider.Thumb aria-label="Volume" />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>,
      );
      const control = container.querySelector(`.${styles.control}`);
      const thumb = container.querySelector<HTMLDivElement>(`.${styles.thumb}`);

      expect(control).toBeInstanceOf(HTMLDivElement);
      expect(thumb).toBeInstanceOf(HTMLDivElement);
      await act(async () => {
        await Promise.resolve();
      });

      expect(thumb).toHaveStyle({ visibility: 'hidden' });

      await act(async () => {
        controlWidth = 200;

        for (const callback of resizeCallbacks) {
          callback();
        }
      });

      expect(thumb?.style.getPropertyValue('--position')).toBe('40.8%');
      expect(thumb).not.toHaveStyle({ visibility: 'hidden' });
      expect(container.querySelector('input[type="range"]')).toHaveValue('40');
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onValueCommitted).not.toHaveBeenCalled();
      const input = container.querySelector('input[type="range"]');

      await act(async () => {
        controlWidth = 400;

        for (const callback of resizeCallbacks) {
          callback();
        }
      });

      expect(thumb?.style.getPropertyValue('--position')).toBe('40.4%');
      expect(container.querySelector(`.${styles.control}`)).toBe(control);
      expect(container.querySelector(`.${styles.thumb}`)).toBe(thumb);
      expect(container.querySelector('input[type="range"]')).toBe(input);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onValueCommitted).not.toHaveBeenCalled();
    },
  );

  it('registers a control added after the root has mounted', async () => {
    const { container, rerender } = render(<Slider.Root defaultValue={40} />);

    rerender(
      <Slider.Root defaultValue={40}>
        <Slider.Control>
          <Slider.Thumb aria-label="Volume" />
        </Slider.Control>
      </Slider.Root>,
    );

    const control = container.querySelector(`.${styles.control}`);
    const thumb = container.querySelector<HTMLDivElement>(`.${styles.thumb}`);

    expect(control).toBeInstanceOf(HTMLDivElement);
    expect(thumb).toBeInstanceOf(HTMLDivElement);

    await act(async () => {
      await Promise.resolve();
    });

    expect(thumb).toHaveStyle({ visibility: 'hidden' });

    await act(async () => {
      controlWidth = 200;

      for (const callback of resizeCallbacks) {
        callback();
      }
    });

    expect(thumb?.style.getPropertyValue('--position')).toBe('40.8%');
    expect(thumb).not.toHaveStyle({ visibility: 'hidden' });
  });

  it('preserves custom rendering, callback refs, and form inputs', () => {
    controlWidth = 200;
    const controlRefCleanup = vi.fn();
    const controlRef = vi.fn(() => controlRefCleanup);
    const renderedControlRef = createRef<HTMLElement>();
    const { container, unmount } = render(
      <Slider.Root defaultValue={40} name="volume">
        <Slider.Control
          ref={controlRef}
          render={<section ref={renderedControlRef} />}
        >
          <Slider.Thumb aria-label="Volume" />
        </Slider.Control>
      </Slider.Root>,
    );
    const control = container.querySelector('section');
    const input = container.querySelector('input[type="range"]');

    expect(controlRef).toHaveBeenCalledExactlyOnceWith(control);
    expect(renderedControlRef.current).toBe(control);
    expect(input).toHaveAttribute('name', 'volume');
    expect(input).toHaveValue('40');
    expect(controlRefCleanup).not.toHaveBeenCalled();

    unmount();

    expect(controlRef).toHaveBeenCalledTimes(1);
    expect(controlRefCleanup).toHaveBeenCalledTimes(1);
    expect(renderedControlRef.current).toBeNull();
    expect(observedElements.size).toBe(0);
  });

  it.each(['edge', 'edge-client-only', 'center'] as const)(
    'preserves the requested %s alignment during server rendering',
    (thumbAlignment) => {
      const markup = renderToString(
        <Slider.Root defaultValue={40} thumbAlignment={thumbAlignment}>
          <Slider.Control>
            <Slider.Thumb aria-label="Volume" />
          </Slider.Control>
        </Slider.Root>,
      );

      expect(markup.includes('data-base-ui-slider-control')).toBe(
        thumbAlignment === 'edge',
      );
      expect(markup.includes('visibility:hidden')).toBe(
        thumbAlignment !== 'center',
      );
      expect(markup.includes('inset-inline-start:40%')).toBe(
        thumbAlignment === 'center',
      );
    },
  );
});
