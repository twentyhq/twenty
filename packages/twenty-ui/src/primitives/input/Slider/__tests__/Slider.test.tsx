import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { type ReactNode } from 'react';

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

describe('Slider measurements', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows an edge-aligned thumb when its first geometry arrives after mounting', async () => {
    let controlWidth = 0;
    let updateGeometry: (() => void) | undefined;
    const disconnect = vi.fn();

    vi.stubGlobal(
      'ResizeObserver',
      class implements ResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          updateGeometry = () => callback([], this);
        }

        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = disconnect;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        const isControl = this.getAttribute('data-testid') === 'volume-control';

        return DOMRect.fromRect({
          width: isControl ? controlWidth : 16,
          height: 16,
        });
      },
    );

    const { unmount } = render(
      <Slider.Root defaultValue={40}>
        <Slider.Control data-testid="volume-control">
          <Slider.Thumb aria-label="Volume" />
        </Slider.Control>
      </Slider.Root>,
    );
    const thumb = screen.getByLabelText('Volume').parentElement;

    await act(async () => {});
    expect(thumb).not.toBeVisible();
    controlWidth = 240;
    await act(async () => updateGeometry?.());
    expect(thumb).toBeVisible();

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('does not start an observer after unmounting before the commit microtask', () => {
    const queuedTasks: (() => void)[] = [];
    const createObserver = vi.fn();

    vi.stubGlobal('queueMicrotask', (callback: () => void) => {
      queuedTasks.push(callback);
    });
    vi.stubGlobal('ResizeObserver', createObserver);

    const { unmount } = render(
      <Slider.Root defaultValue={40}>
        <Slider.Control>
          <Slider.Thumb aria-label="Volume" />
        </Slider.Control>
      </Slider.Root>,
    );

    unmount();
    for (const runTask of queuedTasks) {
      runTask();
    }
    expect(createObserver).not.toHaveBeenCalled();
  });
});
