import { act, cleanup, render, screen } from '@testing-library/react';
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

  const findVolumeSlider = () => screen.getByRole('slider', { hidden: true });

  const resizeVolumeControl = async (width: number) => {
    await act(async () => {
      controlWidth = width;

      for (const callback of resizeCallbacks) {
        callback();
      }
    });
  };

  beforeEach(() => {
    controlWidth = 0;
    observedElements.clear();
    resizeCallbacks.clear();

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        const width =
          this.dataset.testid === 'volume-control' ? controlWidth : 16;

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
    'shows %s thumbs once geometry arrives after mounting',
    async (thumbAlignment) => {
      const onValueChange = vi.fn();
      const onValueCommitted = vi.fn();
      render(
        <Slider.Root
          defaultValue={40}
          thumbAlignment={thumbAlignment}
          onValueChange={onValueChange}
          onValueCommitted={onValueCommitted}
        >
          <Slider.Control data-testid="volume-control">
            <Slider.Track>
              <Slider.Indicator />
              <Slider.Thumb aria-label="Volume" />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>,
      );
      const slider = findVolumeSlider();

      await act(async () => {
        await Promise.resolve();
      });

      expect(slider).not.toBeVisible();

      await resizeVolumeControl(200);

      expect(slider).toBeVisible();
      expect(slider).toHaveValue('40');

      await resizeVolumeControl(400);

      expect(findVolumeSlider()).toBe(slider);
      expect(slider).toBeVisible();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onValueCommitted).not.toHaveBeenCalled();
    },
  );

  it('registers a control added after the root has mounted', async () => {
    const { rerender } = render(<Slider.Root defaultValue={40} />);

    rerender(
      <Slider.Root defaultValue={40}>
        <Slider.Control data-testid="volume-control">
          <Slider.Thumb aria-label="Volume" />
        </Slider.Control>
      </Slider.Root>,
    );

    const slider = findVolumeSlider();

    await act(async () => {
      await Promise.resolve();
    });

    expect(slider).not.toBeVisible();

    await resizeVolumeControl(200);

    expect(slider).toBeVisible();
  });

  it('preserves custom rendering, callback refs, and form inputs', () => {
    controlWidth = 200;
    const controlRefCleanup = vi.fn();
    const controlRef = vi.fn(() => controlRefCleanup);
    const renderedControlRef = createRef<HTMLElement>();
    const { unmount } = render(
      <Slider.Root defaultValue={40} name="volume">
        <Slider.Control
          ref={controlRef}
          data-testid="volume-control"
          render={<section ref={renderedControlRef} />}
        >
          <Slider.Thumb aria-label="Volume" />
        </Slider.Control>
      </Slider.Root>,
    );
    const slider = findVolumeSlider();
    const control = slider.closest('section');

    expect(controlRef).toHaveBeenCalledExactlyOnceWith(control);
    expect(renderedControlRef.current).toBe(control);
    expect(slider).toHaveAttribute('name', 'volume');
    expect(slider).toHaveValue('40');
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
